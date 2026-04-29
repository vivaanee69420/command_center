"""Seed ad accounts, campaigns, and metrics."""
import asyncio
import random
from datetime import date, timedelta, datetime
from uuid import uuid4

from sqlalchemy import select, text
from app.db import SessionLocal
from app.models import AdAccount, AdCampaign, AdMetric, Business


async def main():
    async with SessionLocal() as db:
        # Check if data exists
        existing = (await db.execute(select(AdAccount))).scalars().first()
        if existing:
            print("Ad data already exists, clearing first...")
            await db.execute(text("DELETE FROM ad_metric"))
            await db.execute(text("DELETE FROM ad_campaign"))
            await db.execute(text("DELETE FROM ad_account"))
            await db.commit()

        # Get businesses
        businesses = (await db.execute(select(Business))).scalars().all()
        if not businesses:
            print("No businesses found. Run seed_from_existing.py first.")
            return

        # Pick first 3 businesses for ad accounts
        biz_list = businesses[:3]

        accounts = []
        campaigns_all = []

        for biz in biz_list:
            for platform in ["meta", "google"]:
                acc = AdAccount(
                    id=uuid4(),
                    business_id=biz.id,
                    platform=platform,
                    account_id=f"{platform}-{biz.slug}-{random.randint(1000,9999)}",
                )
                db.add(acc)
                accounts.append(acc)

        await db.flush()

        # Create campaigns per account
        campaign_templates = {
            "meta": [
                ("Brand Awareness", "active", 50),
                ("Lead Generation", "active", 80),
                ("Retargeting", "active", 35),
            ],
            "google": [
                ("Brand Search", "active", 60),
                ("Non-Brand Search", "active", 100),
                ("Display Remarketing", "active", 40),
                ("Performance Max", "paused", 0),
            ],
        }

        for acc in accounts:
            templates = campaign_templates[acc.platform]
            for name, status, budget in templates:
                camp = AdCampaign(
                    id=uuid4(),
                    ad_account_id=acc.id,
                    ext_id=f"ext-{uuid4().hex[:8]}",
                    name=f"{acc.platform.title()} — {name}",
                    status=status,
                    daily_budget=budget if budget else None,
                )
                db.add(camp)
                campaigns_all.append(camp)

        await db.flush()

        # Create 30 days of metrics per active campaign
        today = date.today()
        metric_count = 0
        for camp in campaigns_all:
            if camp.status == "paused":
                continue
            for day_offset in range(30):
                d = today - timedelta(days=day_offset)
                budget = float(camp.daily_budget or 50)
                spend = round(budget * random.uniform(0.7, 1.1), 2)
                impressions = int(spend * random.uniform(80, 200))
                clicks = int(impressions * random.uniform(0.02, 0.08))
                conversions = int(clicks * random.uniform(0.03, 0.12))
                cpa = round(spend / conversions, 2) if conversions else None
                roas = round(random.uniform(1.5, 7.0), 2) if conversions else None

                m = AdMetric(
                    id=uuid4(),
                    campaign_id=camp.id,
                    date=d,
                    spend=spend,
                    impressions=impressions,
                    clicks=clicks,
                    conversions=conversions,
                    cpa=cpa,
                    roas=roas,
                )
                db.add(m)
                metric_count += 1

        await db.commit()
        print(f"Seeded {len(accounts)} ad accounts, {len(campaigns_all)} campaigns, {metric_count} metric rows.")


if __name__ == "__main__":
    asyncio.run(main())
