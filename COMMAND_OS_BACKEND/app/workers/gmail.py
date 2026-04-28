"""Gmail worker. Polls inbox + writes to gmail_message; convert-to-task done in API."""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


async def pull(db: AsyncSession):
    if not settings().GOOGLE_CLIENT_ID:
        return
    # TODO: for each person with provider='gmail' OAuth token,
    # GET https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:1d
    # GET each message metadata, upsert into gmail_message
    return
