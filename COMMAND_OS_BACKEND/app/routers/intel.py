"""Intelligence + automation + integrations + ask-brain endpoints."""
import json
from typing import Optional
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..ai_brain import generate_directives
from ..config import settings
from ..db import get_db
from ..deps import current_user
from ..models import AiDirective, AiWarning, AutomationRule, Notification, OAuthToken, Person
from ..schemas import (
    AskBrainIn, AskBrainOut, DirectiveOut, IntegStatus, NotificationOut, RuleIn, RuleOut, WarningOut,
)

router = APIRouter()


# ---------------- AI Brain ----------------
@router.get("/directives", response_model=list[DirectiveOut])
async def list_directives(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    rows = (await db.execute(
        select(AiDirective).where(
            AiDirective.dismissed_at.is_(None),
            (AiDirective.person_id == p.id) | (AiDirective.person_id.is_(None)),
        ).order_by(AiDirective.score.desc()).limit(20)
    )).scalars().all()
    return rows


@router.post("/directives/{d_id}/dismiss", status_code=204)
async def dismiss_directive(d_id: UUID, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    from datetime import datetime
    d = (await db.execute(select(AiDirective).where(AiDirective.id == d_id))).scalar_one_or_none()
    if not d: raise HTTPException(404, "directive not found")
    d.dismissed_at = datetime.utcnow()
    await db.commit()


@router.get("/warnings", response_model=list[WarningOut])
async def list_warnings(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(
        select(AiWarning).where(AiWarning.closed_at.is_(None)).order_by(AiWarning.severity.desc()).limit(30)
    )).scalars().all()


@router.post("/brain/regenerate")
async def regenerate(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO/COO can trigger regeneration")
    return await generate_directives(db)


@router.post("/ask-brain", response_model=AskBrainOut)
async def ask_brain(body: AskBrainIn, p: Person = Depends(current_user)):
    sys = "You are the AI Brain of GM Dental Group's Command Center OS. Use British English. Be specific."
    if settings().ANTHROPIC_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=60) as c:
                r = await c.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": settings().ANTHROPIC_API_KEY,
                             "anthropic-version": "2023-06-01",
                             "content-type": "application/json"},
                    json={"model": settings().AI_BRAIN_MODEL, "max_tokens": 800,
                          "system": sys, "messages": [{"role": "user", "content": body.question}]},
                )
                r.raise_for_status()
                return AskBrainOut(answer=r.json()["content"][0]["text"], used_llm=True)
        except Exception as e:
            return AskBrainOut(answer=f"[LLM error] {e}", used_llm=False)
    return AskBrainOut(
        answer="No LLM key configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env to enable real Brain answers.",
        used_llm=False,
    )


# ---------------- Notifications ----------------
@router.get("/notifications", response_model=list[NotificationOut])
async def list_notifications(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(
        select(Notification).where(Notification.person_id == p.id)
        .order_by(Notification.sent_at.desc()).limit(50)
    )).scalars().all()


# ---------------- Automations ----------------
@router.get("/automations", response_model=list[RuleOut])
async def list_automations(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(select(AutomationRule).order_by(AutomationRule.name))).scalars().all()


@router.post("/automations", response_model=RuleOut, status_code=201)
async def add_automation(body: RuleIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO/COO can add automation rules")
    r = AutomationRule(**body.model_dump(), owner_id=p.id)
    db.add(r); await db.commit(); await db.refresh(r)
    return r


@router.patch("/automations/{rule_id}", response_model=RuleOut)
async def patch_automation(rule_id: UUID, body: RuleIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403)
    r = (await db.execute(select(AutomationRule).where(AutomationRule.id == rule_id))).scalar_one_or_none()
    if not r: raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(r, k, v)
    await db.commit(); await db.refresh(r)
    return r


# ---------------- Integrations status ----------------
@router.get("/integrations/status", response_model=list[IntegStatus])
async def integ_status(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    rows = (await db.execute(select(OAuthToken).where(OAuthToken.person_id == p.id))).scalars().all()
    out = []
    for r in rows:
        out.append(IntegStatus(provider=r.provider, connected=True, expires_at=r.expires_at, meta=r.meta or {}))
    # Also surface env-keyed providers as available
    env = settings()
    static = []
    if env.META_SYSTEM_USER_TOKEN: static.append("meta_system_user")
    if env.GHL_TOKENS:             static.append("ghl_static")
    if env.DENTALLY_API_KEY:       static.append("dentally")
    if env.ANTHROPIC_API_KEY:      static.append("anthropic")
    if env.OPENAI_API_KEY:         static.append("openai")
    if env.AHREFS_API_KEY:         static.append("ahrefs")
    if env.SEMRUSH_API_KEY:        static.append("semrush")
    if env.TWILIO_ACCOUNT_SID:     static.append("twilio_whatsapp")
    if env.SENDGRID_API_KEY:       static.append("sendgrid")
    for s in static:
        out.append(IntegStatus(provider=s, connected=True, meta={"source": "env"}))
    return out


@router.get("/integrations/{provider}/connect")
async def integ_connect(provider: str):
    """Return the OAuth start URL for the given provider."""
    s = settings()
    if provider == "google":
        scopes = "https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/adwords"
        url = (f"https://accounts.google.com/o/oauth2/v2/auth"
               f"?client_id={s.GOOGLE_CLIENT_ID}&response_type=code&access_type=offline&prompt=consent"
               f"&redirect_uri={s.GOOGLE_REDIRECT_URI}&scope={scopes}")
        return {"oauth_start": url}
    if provider == "meta":
        url = (f"https://www.facebook.com/v19.0/dialog/oauth"
               f"?client_id={s.META_APP_ID}&redirect_uri={s.META_REDIRECT_URI}"
               f"&scope=ads_read,ads_management,business_management&state=meta")
        return {"oauth_start": url}
    raise HTTPException(404, f"unknown provider: {provider}")
