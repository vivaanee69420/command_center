"""Google Calendar worker. Pulls today + next 14 days into calendar_event."""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


async def pull(db: AsyncSession):
    if not settings().GOOGLE_CLIENT_ID:
        return
    # TODO: for each person with calendar OAuth, GET events.list timeMin=now timeMax=now+14d
    # upsert into calendar_event
    return
