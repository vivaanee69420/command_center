"""GoHighLevel worker. Polls sub-accounts every 5 min via GHL v1 API.

ENV format: GHL_TOKENS=ashford=tok1,rochester=tok2,...
Each slug must match a business.slug in the DB.

Pulls:
  - /v1/contacts/  → upserts lead rows (dedup on ghl_contact_id)
  - /v1/opportunities/ → updates lead.stage + lead.value_est from pipeline
"""
import logging
import asyncio
import httpx
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..config import settings
from ..models import Business, Lead

log = logging.getLogger(__name__)

GHL_BASE = "https://rest.gohighlevel.com/v1"

# Map GHL opportunity pipeline stage names → CRM stages
STAGE_MAP = {
    "new lead":        "lead",
    "lead":            "lead",
    "contacted":       "contacted",
    "appointment":     "booked",
    "booked":          "booked",
    "proposal":        "proposal",
    "proposal sent":   "proposal",
    "won":             "won",
    "closed won":      "won",
    "lost":            "lost",
    "closed lost":     "lost",
}


def _map_stage(ghl_stage: str) -> str:
    return STAGE_MAP.get(ghl_stage.lower().strip(), "lead")


async def _fetch_all(client: httpx.AsyncClient, path: str, token: str) -> list[dict]:
    """Paginate GHL endpoint, return all records."""
    headers = {"Authorization": f"Bearer {token}"}
    results = []
    params = {"limit": 100, "startAfterId": ""}

    while True:
        if not params["startAfterId"]:
            params.pop("startAfterId", None)

        resp = await client.get(f"{GHL_BASE}{path}", headers=headers, params=params, timeout=15)
        if resp.status_code == 401:
            log.warning(f"GHL 401 on {path} — token may be expired")
            break
        resp.raise_for_status()
        data = resp.json()

        # contacts endpoint returns {"contacts": [...], "meta": {"nextPageUrl": ...}}
        # opportunities endpoint returns {"opportunities": [...]}
        records = data.get("contacts") or data.get("opportunities") or []
        results.extend(records)

        # Check for next page
        meta = data.get("meta", {})
        next_url = meta.get("nextPageUrl")
        if not next_url or not records:
            break
        # Extract startAfterId from next page URL
        last_id = records[-1].get("id")
        if not last_id:
            break
        params["startAfterId"] = last_id

    return results


async def _upsert_contacts(db: AsyncSession, business_id, contacts: list[dict]):
    """Upsert GHL contacts into lead table."""
    for c in contacts:
        ghl_id = c.get("id")
        if not ghl_id:
            continue

        # Check existing
        existing = (
            await db.execute(select(Lead).where(Lead.ghl_contact_id == ghl_id))
        ).scalar_one_or_none()

        name = " ".join(filter(None, [c.get("firstName", ""), c.get("lastName", "")])).strip() or None
        email = c.get("email") or None
        phone = c.get("phone") or None
        source = c.get("source") or c.get("attributionSource", {}).get("medium") or None

        if existing:
            # Update contact details if changed
            if name:    existing.name = name
            if email:   existing.email = email
            if phone:   existing.phone = phone
            if source:  existing.source = source
            existing.last_touched_at = datetime.utcnow()
        else:
            lead = Lead(
                business_id=business_id,
                ghl_contact_id=ghl_id,
                name=name,
                email=email,
                phone=phone,
                source=source,
                stage="lead",
            )
            db.add(lead)

    await db.commit()


async def _upsert_opportunities(db: AsyncSession, opportunities: list[dict]):
    """Update lead stage + value from GHL opportunities (matched by ghl_contact_id)."""
    for opp in opportunities:
        contact_id = opp.get("contactId") or opp.get("contact", {}).get("id")
        if not contact_id:
            continue

        lead = (
            await db.execute(select(Lead).where(Lead.ghl_contact_id == contact_id))
        ).scalar_one_or_none()
        if not lead:
            continue

        stage_name = opp.get("pipelineStage", {}).get("name", "") or opp.get("status", "")
        if stage_name:
            lead.stage = _map_stage(stage_name)

        monetary = opp.get("monetaryValue")
        if monetary is not None:
            try:
                lead.value_est = float(monetary)
            except (TypeError, ValueError):
                pass

        lead.last_touched_at = datetime.utcnow()

    await db.commit()


async def pull(db: AsyncSession):
    if not settings().GHL_TOKENS:
        log.info("GHL_TOKENS not set — skipping GHL pull")
        return

    # Parse "ashford=tok1,rochester=tok2,..." → [(slug, token), ...]
    pairs = []
    for p in settings().GHL_TOKENS.split(","):
        p = p.strip()
        if "=" in p:
            slug, _, token = p.partition("=")
            pairs.append((slug.strip(), token.strip()))

    if not pairs:
        log.warning("GHL_TOKENS set but no valid slug=token pairs found")
        return

    # Load all businesses once for slug → id lookup
    biz_rows = (await db.execute(select(Business))).scalars().all()
    biz_by_slug = {b.slug: b for b in biz_rows}

    async with httpx.AsyncClient() as client:
        for slug, token in pairs:
            biz = biz_by_slug.get(slug)
            if not biz:
                log.warning(f"GHL: no business with slug='{slug}' — skipping")
                continue

            log.info(f"GHL pull: {slug} ({biz.name})")

            try:
                # 1. Pull contacts
                contacts = await _fetch_all(client, "/contacts/", token)
                log.info(f"  {slug}: {len(contacts)} contacts")
                await _upsert_contacts(db, biz.id, contacts)

                # 2. Pull opportunities (updates stage/value on matched leads)
                opportunities = await _fetch_all(client, "/opportunities/", token)
                log.info(f"  {slug}: {len(opportunities)} opportunities")
                await _upsert_opportunities(db, opportunities)

            except httpx.HTTPStatusError as e:
                log.error(f"GHL HTTP error for {slug}: {e.response.status_code} {e.response.text[:200]}")
            except Exception as e:
                log.exception(f"GHL pull failed for {slug}: {e}")
