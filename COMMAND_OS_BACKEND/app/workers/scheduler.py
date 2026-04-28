"""APScheduler entrypoint — runs every periodic worker."""
import asyncio, logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from ..ai_brain import generate_directives
from ..config import settings
from ..db import SessionLocal
from . import meta_ads, google_ads, gmail, calendar as gcal, gsc, dentally, ghl

log = logging.getLogger("scheduler")
logging.basicConfig(level=logging.INFO)


async def _run(label, fn):
    log.info(f"▶ {label} start")
    async with SessionLocal() as db:
        try: await fn(db)
        except Exception as e: log.exception(f"{label} failed: {e}")
    log.info(f"✔ {label} done")


def main():
    s = AsyncIOScheduler()
    s.add_job(lambda: asyncio.create_task(_run("ai_directives", generate_directives)),
              IntervalTrigger(minutes=settings().AI_BRAIN_INTERVAL_MIN), id="ai_directives")
    s.add_job(lambda: asyncio.create_task(_run("meta_ads",  meta_ads.pull)),  IntervalTrigger(minutes=30), id="meta_ads")
    s.add_job(lambda: asyncio.create_task(_run("google_ads",google_ads.pull)),IntervalTrigger(minutes=30), id="google_ads")
    s.add_job(lambda: asyncio.create_task(_run("gmail",     gmail.pull)),     IntervalTrigger(minutes=1),  id="gmail")
    s.add_job(lambda: asyncio.create_task(_run("calendar",  gcal.pull)),      IntervalTrigger(minutes=5),  id="calendar")
    s.add_job(lambda: asyncio.create_task(_run("gsc",       gsc.pull)),       IntervalTrigger(hours=6),   id="gsc")
    s.add_job(lambda: asyncio.create_task(_run("dentally",  dentally.pull)),  IntervalTrigger(minutes=30), id="dentally")
    s.add_job(lambda: asyncio.create_task(_run("ghl",       ghl.pull)),       IntervalTrigger(minutes=5),  id="ghl")
    # daily 08:00 UK morning brief
    s.add_job(lambda: asyncio.create_task(_run("morning_brief", lambda db: _morning_brief(db))),
              CronTrigger(hour=8, minute=0, timezone="Europe/London"), id="morning_brief")
    s.start()
    log.info("scheduler running. Ctrl-C to stop.")
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        s.shutdown()


async def _morning_brief(db):
    """Send daily routines + AI directives to every active person at 08:00 UK."""
    from sqlalchemy import select
    from ..models import Person
    people = (await db.execute(select(Person).where(Person.status == "active"))).scalars().all()
    log.info(f"morning brief queued for {len(people)} people (WhatsApp wiring TODO)")
    # TODO: render per-person brief and POST to Twilio WhatsApp


if __name__ == "__main__":
    main()
