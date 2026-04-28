"""GoHighLevel worker. Polls 8 sub-accounts (configured via env GHL_TOKENS)."""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


async def pull(db: AsyncSession):
    if not settings().GHL_TOKENS: return
    # Parse env (comma-separated key=value): ashford=tok,rochester=tok,...
    pairs = [p.strip() for p in settings().GHL_TOKENS.split(",") if "=" in p]
    # TODO: for each (slug, token), GET /v1/contacts/?limit=100 → ghl_contact upsert
    # GET /v1/opportunities/ → opportunity upsert
    # On lead.created webhook → emit_task("lead_no_response_5m", ...)
    return
