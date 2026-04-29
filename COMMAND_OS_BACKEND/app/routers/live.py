"""Live proxy endpoints — fetch directly from external APIs (Meta, Google Ads, GHL).
No DB reads/writes. Data comes straight from the API keys in .env.
"""
import json
import logging
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..deps import get_db, current_user
from ..models import Business, Person

log = logging.getLogger(__name__)
router = APIRouter()

META_GRAPH = "https://graph.facebook.com/v19.0"
GHL_BASE = "https://rest.gohighlevel.com/v1"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_ADS_BASE = "https://googleads.googleapis.com/v17"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_ghl_tokens() -> list[tuple[str, str]]:
    if not settings().GHL_TOKENS:
        return []
    pairs = []
    for p in settings().GHL_TOKENS.split(","):
        p = p.strip()
        if "=" in p:
            slug, _, token = p.partition("=")
            pairs.append((slug.strip(), token.strip()))
    return pairs


async def _google_access_token(client: httpx.AsyncClient) -> Optional[str]:
    s = settings()
    if not all([s.GOOGLE_CLIENT_ID, s.GOOGLE_CLIENT_SECRET, s.GOOGLE_ADS_REFRESH_TOKEN]):
        return None
    r = await client.post(
        GOOGLE_TOKEN_URL,
        data={
            "client_id": s.GOOGLE_CLIENT_ID,
            "client_secret": s.GOOGLE_CLIENT_SECRET,
            "refresh_token": s.GOOGLE_ADS_REFRESH_TOKEN,
            "grant_type": "refresh_token",
        },
        timeout=15,
    )
    if r.status_code != 200:
        log.error(f"Google token exchange failed: {r.status_code} {r.text[:200]}")
        return None
    return r.json().get("access_token")


# ─── Meta Campaigns ───────────────────────────────────────────────────────────

@router.get("/live/meta/campaigns")
async def meta_campaigns_live(
    date_preset: str = Query("last_30d"),
    p: Person = Depends(current_user),
):
    """Fetch Meta ad campaigns + insights directly from Graph API."""
    token = settings().META_SYSTEM_USER_TOKEN
    if not token:
        return {"campaigns": [], "error": "META_SYSTEM_USER_TOKEN not configured"}

    campaigns = []
    errors = []

    async with httpx.AsyncClient(timeout=20) as client:
        # Step 1: list all ad accounts the system user has access to
        r = await client.get(
            f"{META_GRAPH}/me/adaccounts",
            params={"access_token": token, "fields": "id,name,account_status,currency"},
        )
        if r.status_code != 200:
            return {"campaigns": [], "error": f"Meta accounts fetch failed: {r.status_code}", "detail": r.text[:300]}

        accounts = r.json().get("data", [])
        if not accounts:
            return {"campaigns": [], "accounts": 0, "note": "No ad accounts found for this token"}

        fields = (
            "id,name,status,"
            "insights.date_preset(" + date_preset + ")"
            "{spend,impressions,clicks,ctr,cpc,actions,cost_per_result}"
        )

        for account in accounts:
            act_id = account["id"]  # "act_123456"
            try:
                cr = await client.get(
                    f"{META_GRAPH}/{act_id}/campaigns",
                    params={"access_token": token, "fields": fields, "limit": 100},
                    timeout=20,
                )
                if cr.status_code != 200:
                    errors.append({"account": act_id, "error": f"HTTP {cr.status_code}"})
                    continue

                for c in cr.json().get("data", []):
                    insights_data = c.get("insights", {})
                    ins = (
                        insights_data.get("data", [{}])[0]
                        if isinstance(insights_data, dict) and insights_data.get("data")
                        else {}
                    )
                    actions = ins.get("actions", []) or []
                    lead_action_types = {
                        "lead", "offsite_conversion.fb_pixel_lead",
                        "offsite_conversion.fb_pixel_purchase", "purchase",
                        "complete_registration",
                    }
                    conversions = sum(
                        float(a.get("value", 0))
                        for a in actions
                        if a.get("action_type") in lead_action_types
                    )
                    campaigns.append({
                        "id": c.get("id"),
                        "name": c.get("name"),
                        "status": c.get("status", "").lower(),
                        "platform": "meta",
                        "account_id": act_id,
                        "account_name": account.get("name"),
                        "spend": float(ins.get("spend") or 0),
                        "impressions": int(ins.get("impressions") or 0),
                        "clicks": int(ins.get("clicks") or 0),
                        "ctr": float(ins.get("ctr") or 0),
                        "cpc": float(ins.get("cpc") or 0),
                        "conversions": int(conversions),
                        "cpa": (float(ins.get("spend") or 0) / conversions) if conversions else 0,
                    })
            except Exception as e:
                errors.append({"account": act_id, "error": str(e)})
                log.exception(f"Meta campaigns error for account {act_id}: {e}")

    return {
        "campaigns": campaigns,
        "accounts_fetched": len(accounts),
        "date_preset": date_preset,
        "errors": errors or None,
    }


# ─── Google Ads Campaigns ──────────────────────────────────────────────────────

GAQL = """
SELECT campaign.id, campaign.name, campaign.status,
       metrics.cost_micros, metrics.impressions, metrics.clicks,
       metrics.ctr, metrics.average_cpc, metrics.conversions
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status != 'REMOVED'
ORDER BY metrics.cost_micros DESC
"""


@router.get("/live/google/campaigns")
async def google_campaigns_live(p: Person = Depends(current_user)):
    """Fetch Google Ads campaigns via GAQL searchStream."""
    s = settings()
    if not s.GOOGLE_ADS_DEVELOPER_TOKEN:
        return {"campaigns": [], "error": "GOOGLE_ADS_DEVELOPER_TOKEN not configured"}
    if not s.GOOGLE_ADS_REFRESH_TOKEN:
        return {"campaigns": [], "error": "GOOGLE_ADS_REFRESH_TOKEN not configured"}

    customer_id = s.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace("-", "")
    if not customer_id:
        return {"campaigns": [], "error": "GOOGLE_ADS_LOGIN_CUSTOMER_ID not configured"}

    async with httpx.AsyncClient(timeout=30) as client:
        access_token = await _google_access_token(client)
        if not access_token:
            return {"campaigns": [], "error": "Failed to obtain Google access token"}

        resp = await client.post(
            f"{GOOGLE_ADS_BASE}/customers/{customer_id}/googleAds:searchStream",
            headers={
                "Authorization": f"Bearer {access_token}",
                "developer-token": s.GOOGLE_ADS_DEVELOPER_TOKEN,
                "login-customer-id": customer_id,
                "Content-Type": "application/json",
            },
            json={"query": GAQL.strip()},
            timeout=30,
        )

        if resp.status_code != 200:
            return {
                "campaigns": [],
                "error": f"Google Ads API error: {resp.status_code}",
                "detail": resp.text[:400],
            }

        campaigns = []
        for line in resp.text.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                batch = json.loads(line)
                for result in batch.get("results", []):
                    c = result.get("campaign", {})
                    m = result.get("metrics", {})
                    spend = int(m.get("costMicros", 0)) / 1_000_000
                    cpc = int(m.get("averageCpc", 0)) / 1_000_000
                    clicks = int(m.get("clicks", 0))
                    conversions = float(m.get("conversions", 0))
                    campaigns.append({
                        "id": str(c.get("id")),
                        "name": c.get("name"),
                        "status": c.get("status", "").lower().replace("_", " "),
                        "platform": "google",
                        "account_name": f"Customer {customer_id}",
                        "spend": round(spend, 2),
                        "impressions": int(m.get("impressions", 0)),
                        "clicks": clicks,
                        "ctr": float(m.get("ctr", 0)),
                        "cpc": round(cpc, 2),
                        "conversions": int(conversions),
                        "cpa": round(spend / conversions, 2) if conversions else 0,
                    })
            except (json.JSONDecodeError, KeyError, TypeError):
                continue

    return {"campaigns": campaigns, "customer_id": customer_id}


# ─── GHL Live Contacts ────────────────────────────────────────────────────────

@router.get("/live/ghl/contacts")
async def ghl_contacts_live(
    slug: str = Query(None, description="Filter by sub-account slug"),
    limit: int = Query(100, ge=1, le=500),
    p: Person = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch GHL contacts directly from API (no DB read/write)."""
    pairs = _parse_ghl_tokens()
    if not pairs:
        return {"contacts": [], "error": "GHL_TOKENS not configured"}

    if slug:
        pairs = [(s, t) for s, t in pairs if s == slug]

    biz_rows = (await db.execute(select(Business))).scalars().all()
    biz_by_slug = {b.slug: b.name for b in biz_rows}

    contacts = []
    errors = []

    async with httpx.AsyncClient(timeout=15) as client:
        for account_slug, token in pairs:
            biz_name = biz_by_slug.get(account_slug, account_slug)
            try:
                resp = await client.get(
                    f"{GHL_BASE}/contacts/",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": min(limit, 100)},
                )
                if resp.status_code == 401:
                    errors.append({"slug": account_slug, "error": "token_expired"})
                    continue
                resp.raise_for_status()
                data = resp.json()
                for c in data.get("contacts", []):
                    name = " ".join(filter(None, [
                        c.get("firstName", ""), c.get("lastName", "")
                    ])).strip() or "Unknown"
                    contacts.append({
                        "id": c.get("id"),
                        "name": name,
                        "email": c.get("email"),
                        "phone": c.get("phone"),
                        "source": c.get("source") or c.get("attributionSource", {}).get("medium"),
                        "stage": c.get("stage") or "lead",
                        "tags": c.get("tags") or [],
                        "business": biz_name,
                        "slug": account_slug,
                        "created_at": c.get("dateAdded"),
                        "last_activity": c.get("dateUpdated"),
                    })
            except httpx.HTTPStatusError as e:
                errors.append({"slug": account_slug, "error": f"HTTP {e.response.status_code}"})
            except Exception as e:
                log.exception(f"GHL contacts error for {account_slug}: {e}")
                errors.append({"slug": account_slug, "error": str(e)})

    return {
        "contacts": contacts,
        "total": len(contacts),
        "errors": errors or None,
    }


# ─── GHL Live Opportunities ───────────────────────────────────────────────────

STAGE_MAP = {
    "new lead": "New Lead", "lead": "New Lead", "contacted": "New Lead",
    "appointment": "Appointment Set", "booked": "Appointment Set", "appointment set": "Appointment Set",
    "showed up": "Showed Up", "showed": "Showed Up",
    "treatment presented": "Treatment Presented", "proposal": "Treatment Presented",
    "won": "Won", "closed won": "Won",
    "lost": "Lost", "closed lost": "Lost",
}


@router.get("/live/ghl/opportunities")
async def ghl_opportunities_live(
    slug: str = Query(None),
    limit: int = Query(100, ge=1, le=500),
    p: Person = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch GHL pipeline opportunities directly from API."""
    pairs = _parse_ghl_tokens()
    if not pairs:
        return {"opportunities": [], "error": "GHL_TOKENS not configured"}

    if slug:
        pairs = [(s, t) for s, t in pairs if s == slug]

    biz_rows = (await db.execute(select(Business))).scalars().all()
    biz_by_slug = {b.slug: b.name for b in biz_rows}

    opportunities = []
    errors = []

    async with httpx.AsyncClient(timeout=15) as client:
        for account_slug, token in pairs:
            biz_name = biz_by_slug.get(account_slug, account_slug)
            try:
                resp = await client.get(
                    f"{GHL_BASE}/opportunities/",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": min(limit, 100)},
                )
                if resp.status_code == 401:
                    errors.append({"slug": account_slug, "error": "token_expired"})
                    continue
                resp.raise_for_status()
                data = resp.json()
                for opp in data.get("opportunities", []):
                    stage_raw = (
                        opp.get("pipelineStage", {}).get("name", "")
                        or opp.get("status", "")
                    ).lower().strip()
                    stage = STAGE_MAP.get(stage_raw, "New Lead")
                    contact = opp.get("contact", {})
                    name = " ".join(filter(None, [
                        contact.get("firstName", ""), contact.get("lastName", "")
                    ])).strip() or opp.get("name") or "Unknown"
                    opportunities.append({
                        "id": opp.get("id"),
                        "name": name,
                        "stage": stage,
                        "value": float(opp.get("monetaryValue") or 0),
                        "status": opp.get("status"),
                        "contact_id": contact.get("id") or opp.get("contactId"),
                        "business": biz_name,
                        "slug": account_slug,
                        "created_at": opp.get("createdAt"),
                        "updated_at": opp.get("updatedAt"),
                    })
            except httpx.HTTPStatusError as e:
                errors.append({"slug": account_slug, "error": f"HTTP {e.response.status_code}"})
            except Exception as e:
                log.exception(f"GHL opportunities error for {account_slug}: {e}")
                errors.append({"slug": account_slug, "error": str(e)})

    return {
        "opportunities": opportunities,
        "total": len(opportunities),
        "errors": errors or None,
    }


# ─── Combined Ads Summary ──────────────────────────────────────────────────────

@router.get("/live/ads/summary")
async def live_ads_summary(
    date_preset: str = Query("last_30d"),
    p: Person = Depends(current_user),
):
    """Aggregate KPIs from both Meta and Google Ads live."""
    s = settings()
    meta_task = None
    google_task = None

    async with httpx.AsyncClient(timeout=30) as client:
        meta_campaigns = []
        google_campaigns = []

        # Meta
        if s.META_SYSTEM_USER_TOKEN:
            try:
                r = await client.get(
                    f"{META_GRAPH}/me/adaccounts",
                    params={"access_token": s.META_SYSTEM_USER_TOKEN, "fields": "id,name"},
                )
                if r.status_code == 200:
                    accounts = r.json().get("data", [])
                    fields = (
                        "id,name,status,insights.date_preset(" + date_preset + ")"
                        "{spend,impressions,clicks,actions}"
                    )
                    for account in accounts:
                        cr = await client.get(
                            f"{META_GRAPH}/{account['id']}/campaigns",
                            params={"access_token": s.META_SYSTEM_USER_TOKEN, "fields": fields, "limit": 100},
                        )
                        if cr.status_code == 200:
                            meta_campaigns.extend(cr.json().get("data", []))
            except Exception as e:
                log.error(f"Live ads summary Meta error: {e}")

        # Google
        if s.GOOGLE_ADS_DEVELOPER_TOKEN and s.GOOGLE_ADS_REFRESH_TOKEN:
            try:
                access_token = await _google_access_token(client)
                customer_id = s.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace("-", "")
                if access_token and customer_id:
                    resp = await client.post(
                        f"{GOOGLE_ADS_BASE}/customers/{customer_id}/googleAds:searchStream",
                        headers={
                            "Authorization": f"Bearer {access_token}",
                            "developer-token": s.GOOGLE_ADS_DEVELOPER_TOKEN,
                            "login-customer-id": customer_id,
                            "Content-Type": "application/json",
                        },
                        json={"query": GAQL.strip()},
                    )
                    if resp.status_code == 200:
                        for line in resp.text.strip().split("\n"):
                            if line.strip():
                                try:
                                    batch = json.loads(line)
                                    google_campaigns.extend(batch.get("results", []))
                                except json.JSONDecodeError:
                                    pass
            except Exception as e:
                log.error(f"Live ads summary Google error: {e}")

    # Aggregate Meta
    meta_spend = meta_clicks = meta_impressions = meta_conversions = 0.0
    for c in meta_campaigns:
        ins_data = c.get("insights", {})
        ins = ins_data.get("data", [{}])[0] if isinstance(ins_data, dict) else {}
        meta_spend += float(ins.get("spend") or 0)
        meta_clicks += int(ins.get("clicks") or 0)
        meta_impressions += int(ins.get("impressions") or 0)
        actions = ins.get("actions") or []
        lead_types = {"lead", "offsite_conversion.fb_pixel_lead", "complete_registration"}
        meta_conversions += sum(float(a.get("value", 0)) for a in actions if a.get("action_type") in lead_types)

    # Aggregate Google
    google_spend = google_clicks = google_impressions = google_conversions = 0.0
    for result in google_campaigns:
        m = result.get("metrics", {})
        google_spend += int(m.get("costMicros", 0)) / 1_000_000
        google_clicks += int(m.get("clicks", 0))
        google_impressions += int(m.get("impressions", 0))
        google_conversions += float(m.get("conversions", 0))

    total_spend = meta_spend + google_spend
    total_conversions = meta_conversions + google_conversions

    return {
        "total_spend": round(total_spend, 2),
        "total_clicks": int(meta_clicks + google_clicks),
        "total_impressions": int(meta_impressions + google_impressions),
        "total_conversions": int(total_conversions),
        "avg_cpa": round(total_spend / total_conversions, 2) if total_conversions else 0,
        "meta": {
            "spend": round(meta_spend, 2),
            "clicks": int(meta_clicks),
            "impressions": int(meta_impressions),
            "conversions": int(meta_conversions),
            "campaigns": len(meta_campaigns),
        },
        "google": {
            "spend": round(google_spend, 2),
            "clicks": int(google_clicks),
            "impressions": int(google_impressions),
            "conversions": int(google_conversions),
            "campaigns": len(google_campaigns),
        },
        "date_preset": date_preset,
    }
