"""Seed Postgres from the existing CommandOS data files.

Imports:
  - 9 GM businesses
  - 10 users (CEO/COO/team/outsourcers) with hashed passwords
  - 296 seed tasks from _research_cache/tasks_seed.json (if available)
  - Empty automation rules + a sample default

Run:
  docker compose up -d postgres
  python seed_from_existing.py
"""
import asyncio, json, os, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select

# Allow running from project root
sys.path.insert(0, str(Path(__file__).parent))
from app.db import SessionLocal
from app.models import (
    Business, Person, Task, AutomationRule, AiDirective,
)
from app.security import hash_password


BUSINESSES = [
    ("warwick_lodge",        "Warwick Lodge Dental Implant Centre", "practice", "#0e2a47", 200000, "Herne Bay, Kent"),
    ("fixed_teeth_solutions","Fixed Teeth Solutions",                "practice", "#1f6fb5", 120000, "Bexleyheath"),
    ("ashford",              "Ashford Dental Practice",              "practice", "#16a34a", 150000, "Ashford, Kent"),
    ("rochester",            "Rochester Dental Practice",            "practice", "#10b981",  90000, "Rochester, Kent"),
    ("barnet",               "Barnet Dental Practice",               "practice", "#7c3aed", 130000, "Barnet, London"),
    ("gm_lab",               "GM Dental Lab",                        "lab",      "#444444",  80000, "Kent"),
    ("plan4growth",          "Plan4Growth Academy",                  "academy",  "#c9a227", 100000, "UK + India"),
    ("biological_clinician", "Biological Clinician",                 "academy",  "#3b7a3b",  83000, "UK + EU"),
    ("elevate",              "Elevate Accounts",                     "saas",     "#7a3b9b",  83000, "UK"),
]

PEOPLE = [
    # username, name, role, password, color, layers, modules
    ("gaurav",     "Gaurav Mehta",      "CEO",                "ceo123", "#0e2a47"),
    ("nadia",      "Nadia Reinolds",    "COO",                "coo123", "#7c3aed"),
    ("nikhil",     "Nikhil",            "Marketing Lead",     "mkt123", "#f59e0b"),
    ("ruhith",     "Ruhith",            "Digital + Elevate",  "dig123", "#2e75b6"),
    ("maryam",     "Maryam",            "Practice Ops",       "ops123", "#16a34a"),
    ("fatima",     "Fatima",            "Lab BD",             "lab123", "#ef4444"),
    ("veena",      "Veena",             "SDR",                "sdr123", "#5b9f61"),
    ("seo_outsource",    "SEO Outsourcer",    "SEO Specialist",     "seo123", "#3b82f6"),
    ("social_outsource", "Social Outsourcer", "Social Specialist",  "soc123", "#fb923c"),
    ("contractor1",      "Contractor One",    "General Outsourcer", "con123", "#94a3b8"),
]

DEFAULT_RULES = [
    ("New lead → Speed-to-lead in 5 min",   "event", {"event": "lead.created"},      "create_task", {"role": "SDR", "priority": "P0", "sla_min": 5}),
    ("Task overdue >24h → escalate",        "event", {"event": "task.overdue", "hours": 24}, "escalate", {"to_role": "COO"}),
    ("Dentally no-show → recovery flow",    "event", {"event": "dentally.no_show"}, "create_task", {"role": "Practice Ops", "priority": "P1", "sla_h": 1}),
    ("Daily morning brief 08:00 UK",        "schedule", {"cron": "0 8 * * 1-5"},     "send_whatsapp", {"to": "all_active"}),
    ("Friday weekly review prompt",         "schedule", {"cron": "0 16 * * 5"},      "send_whatsapp", {"to": "Gaurav Mehta"}),
    ("Ad CPL >2x target → kill or rotate",  "event", {"event": "ad.cpl_drift", "x": 2}, "create_task", {"role": "Digital + Elevate", "priority": "P0", "sla_h": 24}),
    ("Treatment plan accepted → onboarding","event", {"event": "treatment.accepted"},"start_journey",{"stage": "onboarding"}),
    ("Revenue below 90% pace → action plan","event", {"event": "revenue.below_pace", "pct": 0.9}, "create_task", {"role": "Practice Ops", "priority": "P0"}),
    ("GSC keyword drop top10 → SEO brief",  "event", {"event": "gsc.keyword_drop"},  "create_task", {"role": "SEO Specialist", "priority": "P1", "sla_d": 5}),
    ("Cohort registration close in 7 days", "schedule", {"cron": "0 9 * * *"},      "send_whatsapp", {"to": "Nikhil"}),
]


async def main():
    async with SessionLocal() as db:
        # ---- Businesses ----
        existing_biz = {b.slug for b in (await db.execute(select(Business))).scalars().all()}
        for slug, name, typ, color, target, location in BUSINESSES:
            if slug in existing_biz: continue
            db.add(Business(slug=slug, name=name, type=typ, color=color,
                            target_monthly=target, location=location))
        await db.commit()
        print(f"✓ businesses: {len(BUSINESSES)}")

        # ---- People ----
        existing_users = {p.username for p in (await db.execute(select(Person))).scalars().all()}
        biz_index = {b.slug: b for b in (await db.execute(select(Business))).scalars().all()}
        for u, name, role, pw, color in PEOPLE:
            if u in existing_users: continue
            db.add(Person(
                username=u, name=name, role=role, password_hash=hash_password(pw),
                color=color, status="active",
                scope_layers=["control","execution","brain","growth","data"] if role in ("CEO","COO") else ["execution"],
            ))
        await db.commit()
        print(f"✓ people: {len(PEOPLE)}")

        # ---- Tasks (from existing JSON if present) ----
        seed_path = Path(__file__).resolve().parent.parent / "_research_cache" / "tasks_seed.json"
        if seed_path.exists():
            with open(seed_path) as f:
                seed = json.load(f)
            people_by_name = {p.name: p for p in (await db.execute(select(Person))).scalars().all()}
            biz_by_short = {}
            for b in biz_index.values():
                short = b.name.split(" ")[0].lower()
                biz_by_short[short] = b
            n = 0
            now = datetime.now(timezone.utc)
            for raw in seed.get("tasks", []):
                owner = people_by_name.get(raw.get("owner")) or people_by_name.get("Gaurav Mehta")
                # Skip if existing has same title for owner
                exists = (await db.execute(
                    select(Task).where(Task.owner_id == owner.id, Task.title == raw["title"][:200])
                )).scalar_one_or_none()
                if exists: continue
                business_short = (raw.get("businessName") or "").split(" ")[0].lower()
                biz = biz_by_short.get(business_short)
                # Parse due
                try:
                    due = datetime.fromisoformat(raw["due"]).replace(tzinfo=timezone.utc)
                except Exception:
                    due = now + timedelta(days=7)
                if due < now: due = now + timedelta(days=raw.get("priority","P2") == "P0" and 1 or 7)
                db.add(Task(
                    title=raw["title"][:200], body_md=raw.get("description",""),
                    business_id=biz.id if biz else None,
                    owner_id=owner.id, due_at=due,
                    priority=raw.get("priority","P2"),
                    status="backlog", source="seed", source_ref=raw.get("id"),
                ))
                n += 1
            await db.commit()
            print(f"✓ tasks imported from seed: {n}")
        else:
            print("⚠ no tasks_seed.json found — skipping task import")

        # ---- Automation rules ----
        existing_rules = {r.name for r in (await db.execute(select(AutomationRule))).scalars().all()}
        for name, tk, tcfg, ak, acfg in DEFAULT_RULES:
            if name in existing_rules: continue
            db.add(AutomationRule(name=name, trigger_kind=tk, trigger_config=tcfg,
                                  action_kind=ak, action_config=acfg, enabled=True))
        await db.commit()
        print(f"✓ default automation rules: {len(DEFAULT_RULES)}")

        # ---- A welcome directive ----
        gaurav = (await db.execute(select(Person).where(Person.username == "gaurav"))).scalar_one_or_none()
        if gaurav:
            db.add(AiDirective(
                person_id=gaurav.id, kind="action", score=0.95,
                text="Welcome to Command Center OS — every signal becomes an owned task. "
                     "Add API keys in .env to switch the engine to live data.",
            ))
            await db.commit()

        print("\n✓ seed complete. Login as gaurav / ceo123")


if __name__ == "__main__":
    asyncio.run(main())
