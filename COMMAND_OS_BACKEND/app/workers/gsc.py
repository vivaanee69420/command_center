"""Search Console worker. Pulls last-28d query data per verified site."""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


async def pull(db: AsyncSession):
    if not settings().GOOGLE_CLIENT_ID: return
    # TODO: for each seo_property with gsc_site, POST searchAnalytics/query with rowLimit=100,
    # upsert into seo_keyword (track yesterday vs today position deltas; emit task on -3 drop)
    return
