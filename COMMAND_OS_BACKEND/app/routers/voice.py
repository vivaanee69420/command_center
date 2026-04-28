"""Voice → tasks: transcript splitter (LLM if keyed, procedural fallback) + approval flow."""
import json, re
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db import get_db
from ..deps import current_user
from ..models import Person, Business
from ..schemas import VoiceSplitIn, VoiceSplitOut, VoiceTaskItem, VoiceApproveIn, TaskOut
from ..task_engine import emit_voice_tasks

router = APIRouter()

TEAM_KEYWORDS = {
    "Gaurav Mehta":   ["gaurav", "ceo", "myself", "i'll", "i will"],
    "Nadia Reinolds": ["nadia", "coo", "ops", "operations"],
    "Ruhith":         ["ruhith", "digital", "elevate", "ghl", "tech", "api"],
    "Maryam":         ["maryam", "practice", "reception", "hygienist", "front desk"],
    "Nikhil":         ["nikhil", "marketing", "social", "content", "video", "reel", "ad", "campaign"],
    "Fatima":         ["fatima", "lab", "bd", "case"],
    "Veena":          ["veena", "sdr", "outbound", "call", "dial"],
}
BIZ_KEYWORDS = {
    "warwick_lodge":         ["warwick", "implant centre"],
    "fixed_teeth_solutions": ["fixed teeth", "fts", "all on 4", "all-on-4"],
    "ashford":               ["ashford"],
    "rochester":             ["rochester"],
    "barnet":                ["barnet"],
    "gm_lab":                ["lab"],
    "plan4growth":           ["plan4growth", "p4g", "academy", "diploma", "cohort"],
    "biological_clinician":  ["biological"],
    "elevate":               ["elevate", "ir35", "accountant"],
}


def _suggest_owner(text: str) -> Optional[str]:
    t = text.lower()
    for name, kws in TEAM_KEYWORDS.items():
        if any(k in t for k in kws): return name
    return None


def _suggest_biz(text: str) -> Optional[str]:
    t = text.lower()
    for slug, kws in BIZ_KEYWORDS.items():
        if any(k in t for k in kws): return slug
    return None


def _suggest_priority(text: str) -> str:
    t = text.lower()
    if re.search(r"\b(urgent|asap|today|now|critical|blocker)\b", t): return "P0"
    if re.search(r"\b(important|priority|high|this week)\b", t):       return "P1"
    if re.search(r"\b(low|whenever|maybe|later|eventually)\b", t):     return "P3"
    return "P2"


def _suggest_due(text: str) -> datetime:
    t = text.lower()
    now = datetime.now(timezone.utc)
    if re.search(r"\b(today|asap|now)\b", t):     return now + timedelta(hours=8)
    if re.search(r"\btomorrow\b", t):              return now + timedelta(days=1)
    if re.search(r"\bthis week\b", t):             return now + timedelta(days=5)
    if re.search(r"\bnext week\b", t):             return now + timedelta(days=10)
    if re.search(r"\bthis month\b", t):            return now + timedelta(days=21)
    return now + timedelta(days=3)


def split_procedural(transcript: str) -> list[VoiceTaskItem]:
    chunks = re.split(r"(?:[.!?]+\s+|(?:^|\s)(?:then|after that|next|also|and then|plus)\s+|[;\n]+)", transcript, flags=re.I)
    items: list[VoiceTaskItem] = []
    for c in chunks:
        c = (c or "").strip()
        if len(c) < 5: continue
        items.append(VoiceTaskItem(
            title=c[:1].upper() + c[1:120],
            owner_name=_suggest_owner(c),
            business_slug=_suggest_biz(c),
            priority=_suggest_priority(c),
            due_at=_suggest_due(c),
        ))
    return items


async def split_llm(transcript: str) -> Optional[list[VoiceTaskItem]]:
    if not settings().ANTHROPIC_API_KEY and not settings().OPENAI_API_KEY:
        return None
    sys = (
        "Split a UK dental-group CEO's voice note into discrete tasks. "
        "Return a JSON array. Each item: "
        "{title, owner_name (one of: Gaurav Mehta, Nadia Reinolds, Ruhith, Maryam, Nikhil, Fatima, Veena), "
        "business_slug (warwick_lodge|fixed_teeth_solutions|ashford|rochester|barnet|gm_lab|plan4growth|biological_clinician|elevate|cross), "
        "priority (P0|P1|P2|P3), due_at (ISO 8601, UTC)}. "
        "Use British English. Return ONLY the JSON array, no fences."
    )
    try:
        if settings().ANTHROPIC_API_KEY:
            async with httpx.AsyncClient(timeout=45) as c:
                r = await c.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": settings().ANTHROPIC_API_KEY,
                             "anthropic-version": "2023-06-01",
                             "content-type": "application/json"},
                    json={"model": settings().AI_BRAIN_MODEL, "max_tokens": 1200,
                          "system": sys, "messages": [{"role": "user", "content": transcript}]},
                )
                r.raise_for_status()
                text = r.json()["content"][0]["text"].strip()
                if text.startswith("```"):
                    text = text.split("```", 2)[1].lstrip("json\n").rstrip("`").strip()
                arr = json.loads(text)
        else:
            async with httpx.AsyncClient(timeout=45) as c:
                r = await c.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings().OPENAI_API_KEY}",
                             "content-type": "application/json"},
                    json={"model": "gpt-4o-mini",
                          "response_format": {"type": "json_object"},
                          "messages": [{"role": "system", "content": sys},
                                       {"role": "user", "content": transcript}]},
                )
                r.raise_for_status()
                obj = json.loads(r.json()["choices"][0]["message"]["content"])
                arr = obj.get("tasks", obj if isinstance(obj, list) else [])
        return [VoiceTaskItem(**x) for x in arr]
    except Exception as e:
        print("voice LLM split failed:", e)
        return None


@router.post("/split", response_model=VoiceSplitOut)
async def voice_split(body: VoiceSplitIn, p: Person = Depends(current_user)):
    items = await split_llm(body.transcript) or split_procedural(body.transcript)
    return VoiceSplitOut(transcript=body.transcript, items=items, via_llm=bool(items and items[0].title))


@router.post("/approve", response_model=list[TaskOut])
async def voice_approve(body: VoiceApproveIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    # Resolve owner names → owner_ids
    people = {x.name: x for x in (await db.execute(select(Person))).scalars().all()}
    biz = {b.slug: b for b in (await db.execute(select(Business))).scalars().all()}
    payload = []
    for it in body.items:
        owner = it.owner_id
        if not owner and it.owner_name and it.owner_name in people:
            owner = people[it.owner_name].id
        if not owner:
            continue
        b = biz.get(it.business_slug or "") if it.business_slug else None
        payload.append({
            "title": it.title,
            "owner_id": owner,
            "due_at": it.due_at,
            "priority": it.priority,
            "business_id": b.id if b else None,
        })
    return await emit_voice_tasks(db, transcript=body.transcript, items=payload, actor_id=p.id)
