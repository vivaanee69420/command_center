"""Conversations router — proxies GHL conversations API across all sub-accounts."""
import logging
import httpx
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..deps import get_db, current_user
from ..models import Business, Person

log = logging.getLogger(__name__)
router = APIRouter()

GHL_BASE = "https://rest.gohighlevel.com/v1"

CHANNEL_LABELS = {
    "TYPE_WHATSAPP": "WhatsApp",
    "TYPE_SMS":       "SMS",
    "TYPE_EMAIL":     "Email",
    "TYPE_FB":        "Facebook",
    "TYPE_IG":        "Instagram",
    "TYPE_CALL":      "Call",
    "WhatsApp":       "WhatsApp",
    "SMS":            "SMS",
    "Email":          "Email",
}

CHANNEL_COLORS = {
    "WhatsApp":  "bg-green-100 text-green-700",
    "SMS":       "bg-blue-100 text-blue-700",
    "Email":     "bg-gray-100 text-gray-700",
    "Facebook":  "bg-blue-100 text-blue-800",
    "Instagram": "bg-pink-100 text-pink-700",
    "Call":      "bg-purple-100 text-purple-700",
}


def _parse_tokens() -> list[tuple[str, str]]:
    """Parse GHL_TOKENS env → [(slug, token), ...]"""
    if not settings().GHL_TOKENS:
        return []
    pairs = []
    for p in settings().GHL_TOKENS.split(","):
        p = p.strip()
        if "=" in p:
            slug, _, token = p.partition("=")
            pairs.append((slug.strip(), token.strip()))
    return pairs


def _fmt_convo(c: dict, business_name: str, slug: str) -> dict:
    raw_type = c.get("type") or c.get("lastMessageType") or ""
    channel = CHANNEL_LABELS.get(raw_type, raw_type or "SMS")
    return {
        "id":           c.get("id"),
        "contact_id":   c.get("contactId"),
        "name":         c.get("fullName") or c.get("contactName") or "Unknown",
        "preview":      (c.get("lastMessageBody") or "")[:120],
        "channel":      channel,
        "channel_class": CHANNEL_COLORS.get(channel, "bg-gray-100 text-gray-700"),
        "unread":       c.get("unreadCount", 0),
        "last_message_at": c.get("lastMessageDate") or c.get("dateUpdated"),
        "business":     business_name,
        "slug":         slug,
    }


@router.get("/conversations")
async def list_conversations(
    limit: int = Query(50, ge=1, le=200),
    slug: str = Query(None, description="Filter by sub-account slug"),
    p: Person = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch conversations from GHL across all (or one) sub-account(s)."""
    pairs = _parse_tokens()
    if not pairs:
        return {"conversations": [], "total": 0, "error": "GHL_TOKENS not configured"}

    # Filter by slug if requested
    if slug:
        pairs = [(s, t) for s, t in pairs if s == slug]

    # Load business names
    biz_rows = (await db.execute(select(Business))).scalars().all()
    biz_by_slug = {b.slug: b.name for b in biz_rows}

    results = []
    errors = []

    async with httpx.AsyncClient(timeout=15) as client:
        for account_slug, token in pairs:
            biz_name = biz_by_slug.get(account_slug, account_slug)
            try:
                resp = await client.get(
                    f"{GHL_BASE}/conversations/search",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"limit": limit, "sort": "last_message_date", "sortDirection": "desc"},
                )
                if resp.status_code == 401:
                    errors.append({"slug": account_slug, "error": "token_expired"})
                    continue
                resp.raise_for_status()
                data = resp.json()
                convos = data.get("conversations") or []
                for c in convos:
                    results.append(_fmt_convo(c, biz_name, account_slug))
            except httpx.HTTPStatusError as e:
                errors.append({"slug": account_slug, "error": f"HTTP {e.response.status_code}"})
            except Exception as e:
                log.exception(f"GHL conversations error for {account_slug}: {e}")
                errors.append({"slug": account_slug, "error": str(e)})

    # Sort by last_message_at desc
    results.sort(key=lambda x: x.get("last_message_at") or "", reverse=True)

    return {
        "conversations": results[:limit],
        "total": len(results),
        "errors": errors if errors else None,
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    slug: str = Query(..., description="Sub-account slug (required to select token)"),
    p: Person = Depends(current_user),
):
    """Fetch messages for a specific conversation."""
    pairs = _parse_tokens()
    token_map = dict(pairs)
    token = token_map.get(slug)
    if not token:
        return {"messages": [], "error": f"No token for slug '{slug}'"}

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{GHL_BASE}/conversations/{conversation_id}/messages",
                headers={"Authorization": f"Bearer {token}"},
                params={"limit": 50},
            )
            if resp.status_code == 401:
                return {"messages": [], "error": "token_expired"}
            resp.raise_for_status()
            data = resp.json()
            return {"messages": data.get("messages") or []}
        except Exception as e:
            return {"messages": [], "error": str(e)}
