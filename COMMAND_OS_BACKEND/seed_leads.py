"""Seed leads for CRM pipeline."""
import asyncio
import random
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import select, text
from app.db import SessionLocal
from app.models import Lead, Business, Person


STAGES = ["lead", "contacted", "booked", "proposal", "won", "lost"]
SOURCES = ["Meta", "Google", "Referral", "GHL", "Website", "Walk-in"]
PERSONAS = ["Implant", "Cosmetic", "Ortho", "General", "Whitening", "Emergency"]

FIRST_NAMES = ["Sarah", "James", "Aisha", "Tom", "Emma", "Jack", "Ravi", "Olivia", "Daniel", "Sophia",
               "Michael", "Jessica", "Chris", "Amanda", "Ryan", "Emily", "Matthew", "Isabella", "David", "Lucy",
               "Priya", "Nathan", "Chloe", "Tariq", "Gemma", "Harry", "Fatima", "George", "Zara", "Ben"]
LAST_NAMES = ["Johnson", "Patel", "O'Connor", "Khan", "Whitfield", "Robinson", "Mensah", "Kumar", "Clark",
              "Martinez", "Brown", "Davis", "Wilson", "Smith", "Taylor", "Lee", "White", "Harris", "Thomas", "Martin"]


async def main():
    async with SessionLocal() as db:
        existing = (await db.execute(select(Lead))).scalars().first()
        if existing:
            print("Leads exist, clearing...")
            await db.execute(text("DELETE FROM lead"))
            await db.commit()

        businesses = (await db.execute(select(Business))).scalars().all()
        people = (await db.execute(select(Person))).scalars().all()
        if not businesses:
            print("No businesses. Run seed_from_existing.py first.")
            return

        owners = [p for p in people if p.role in ("SDR", "Marketing Lead", "CEO", "COO")]
        if not owners:
            owners = people[:3]

        count = 0
        for _ in range(40):
            biz = random.choice(businesses)
            stage = random.choices(STAGES, weights=[25, 20, 18, 15, 15, 7])[0]
            value = random.choice([1500, 2200, 3200, 4500, 5100, 6800, 7500, 9200, 11200, 15000])
            days_ago = random.randint(0, 60)

            lead = Lead(
                id=uuid4(),
                business_id=biz.id,
                source=random.choice(SOURCES),
                persona=random.choice(PERSONAS),
                name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                email=f"lead{count}@example.com",
                phone=f"07700 {random.randint(100000, 999999)}",
                stage=stage,
                value_est=value,
                owner_id=random.choice(owners).id if owners else None,
                created_at=datetime.utcnow() - timedelta(days=days_ago),
                last_touched_at=datetime.utcnow() - timedelta(days=random.randint(0, days_ago)),
            )
            db.add(lead)
            count += 1

        await db.commit()
        print(f"Seeded {count} leads.")


if __name__ == "__main__":
    asyncio.run(main())
