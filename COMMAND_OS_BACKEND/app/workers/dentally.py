"""Dentally worker. Pulls payments + appointments + treatment plans per practice."""
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings


async def pull(db: AsyncSession):
    if not settings().DENTALLY_API_KEY: return
    # TODO: GET /patient_payments?since=yesterday → revenue_snapshot
    # GET /appointments?date=today → booking
    # On no_show flag → emit_task("dentally_no_show", ...)
    return
