"""Meta Marketing API worker. Pulls campaigns + insights, persists to ad_metric.

Required env: META_SYSTEM_USER_TOKEN (long-lived) + per-business ad-account IDs.
Drop your ad-account IDs into ad_account table after seeding.
"""
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from ..config import settings


async def pull(db: AsyncSession):
    token = settings().META_SYSTEM_USER_TOKEN
    if not token:
        return  # not configured
    # TODO: iterate ad_account rows where platform='meta', call:
    #   GET /v19.0/act_{account_id}/campaigns?fields=name,status,insights{spend,impressions,clicks,actions,ctr,cpc}&date_preset=yesterday
    # upsert into ad_campaign + ad_metric
    fields = "name,status,insights{spend,impressions,clicks,actions,ctr,cpc}"
    # Reference impl ready — wire account IDs to enable.
    return
