"""Google Ads worker. Uses GAQL via googleads:searchStream.

Required env: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
Per-customer refresh token is stored in oauth_token rows after OAuth handshake.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


GAQL = (
    "SELECT campaign.id, campaign.name, campaign.status, "
    "metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, "
    "metrics.average_cpc, metrics.conversions "
    "FROM campaign WHERE segments.date DURING LAST_30_DAYS"
)


async def pull(db: AsyncSession):
    if not settings().GOOGLE_ADS_DEVELOPER_TOKEN:
        return
    # TODO: read refresh tokens from oauth_token where provider='google_ads',
    # exchange for access_token, POST GAQL to googleads.googleapis.com/v17/customers/{cust}/googleAds:searchStream,
    # upsert into ad_campaign + ad_metric
    return
