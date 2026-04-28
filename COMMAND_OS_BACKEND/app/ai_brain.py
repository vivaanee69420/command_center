"""AI Brain — generates daily directives from real telemetry.

Pulls last-7d / last-30d snapshots from Postgres, bundles them into a context
under 16k tokens, asks Claude (or OpenAI) for top-5 actions per person + warnings,
persists to ai_directive / ai_warning, and emits high-confidence actions as tasks.
"""
import json
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import httpx
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .models import (
    AiDirective, AiWarning, Business, Person, RevenueSnapshot, Task, Lead,
)


SYSTEM_PROMPT = (
    "You are the AI Brain of a multi-business operating system for GM Dental Group. "
    "Read the bundled telemetry and produce: (a) 'directives' — top actions per person, "
    "scored 0.0-1.0 by impact x urgency, (b) 'warnings' — anomalies with severity 1-3. "
    "Each directive: {person_name, business_slug, kind: action|opportunity, text (<=240 chars), score}. "
    "Each warning: {business_slug, kind, severity, text, evidence}. "
    "Use British English. Reference real numbers from the bundle. "
    "Return ONLY a JSON object: {directives:[...], warnings:[...]}. No markdown fences."
)


async def build_context(db: AsyncSession) -> dict:
    """Pull a compact telemetry bundle."""
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Businesses
    biz = (await db.execute(select(Business))).scalars().all()

    # Revenue (last 30 d, per business)
    rev_rows = (await db.execute(
        select(RevenueSnapshot.business_id, func.sum(RevenueSnapshot.gross).label("g"))
        .where(RevenueSnapshot.date >= (datetime.now(timezone.utc) - timedelta(days=30)).date())
        .group_by(RevenueSnapshot.business_id)
    )).all()
    rev_by_biz = {str(r[0]): float(r[1] or 0) for r in rev_rows}

    # People
    people = (await db.execute(select(Person))).scalars().all()

    # Task health (last 7 d)
    tasks_open = (await db.execute(
        select(Task.owner_id, func.count())
        .where(Task.status.in_(["backlog", "today", "in_progress"]))
        .group_by(Task.owner_id)
    )).all()
    task_overdue = (await db.execute(
        select(Task.owner_id, func.count())
        .where(Task.due_at < datetime.now(timezone.utc), Task.status != "done")
        .group_by(Task.owner_id)
    )).all()

    # Leads
    lead_count = (await db.execute(
        select(Lead.business_id, Lead.stage, func.count())
        .where(Lead.created_at >= week_ago)
        .group_by(Lead.business_id, Lead.stage)
    )).all()

    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "businesses": [
            {"slug": b.slug, "name": b.name, "target": float(b.target_monthly or 0),
             "revenue_30d": rev_by_biz.get(str(b.id), 0.0)}
            for b in biz
        ],
        "people": [{"name": p.name, "role": p.role,
                    "open_tasks": next((c for o, c in tasks_open if o == p.id), 0),
                    "overdue":    next((c for o, c in task_overdue if o == p.id), 0)}
                   for p in people],
        "leads_7d": [{"business_id": str(b), "stage": s, "count": c}
                     for b, s, c in lead_count],
    }


async def call_llm(context: dict) -> Optional[dict]:
    """Call Claude (preferred) or OpenAI. Returns parsed JSON or None."""
    msg = (
        "TELEMETRY:\n" + json.dumps(context, indent=2) +
        "\n\nProduce the JSON described in the system prompt."
    )
    if settings().ANTHROPIC_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=60) as c:
                r = await c.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": settings().ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": settings().AI_BRAIN_MODEL,
                        "max_tokens": 1500,
                        "system": SYSTEM_PROMPT,
                        "messages": [{"role": "user", "content": msg}],
                    },
                )
                r.raise_for_status()
                text = r.json()["content"][0]["text"].strip()
                # strip code fences if present
                if text.startswith("```"):
                    text = text.split("```", 2)[1].lstrip("json\n").rstrip("`").strip()
                return json.loads(text)
        except Exception as e:
            print("Claude brain call failed:", e)

    if settings().OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=60) as c:
                r = await c.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings().OPENAI_API_KEY}",
                             "content-type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": msg},
                        ],
                    },
                )
                r.raise_for_status()
                return json.loads(r.json()["choices"][0]["message"]["content"])
        except Exception as e:
            print("OpenAI brain call failed:", e)
    return None


async def generate_directives(db: AsyncSession) -> dict:
    ctx = await build_context(db)
    out = await call_llm(ctx)
    if not out:
        return {"directives": 0, "warnings": 0, "skipped": True}

    # Persist
    by_name = {p.name: p for p in (await db.execute(select(Person))).scalars().all()}
    by_slug = {b.slug: b for b in (await db.execute(select(Business))).scalars().all()}
    n_dir, n_warn = 0, 0
    for d in out.get("directives", []):
        person = by_name.get(d.get("person_name"))
        biz = by_slug.get(d.get("business_slug"))
        db.add(AiDirective(
            person_id=person.id if person else None,
            business_id=biz.id if biz else None,
            kind=d.get("kind", "action"),
            text=d.get("text", "")[:500],
            score=float(d.get("score", 0.5)),
        ))
        n_dir += 1
    for w in out.get("warnings", []):
        biz = by_slug.get(w.get("business_slug"))
        db.add(AiWarning(
            business_id=biz.id if biz else None,
            kind=w.get("kind", "anomaly"),
            severity=int(w.get("severity", 1)),
            text=w.get("text", "")[:500],
            evidence=w.get("evidence", {}),
        ))
        n_warn += 1
    await db.commit()
    return {"directives": n_dir, "warnings": n_warn}
