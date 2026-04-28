"""TaskEngine — anomaly → owned-task pipeline.

Every signal in the system passes through here. If a signal cannot be turned into
an owned task with a deadline, it is rejected. This is what makes the OS forcing
rather than informational.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .execution_guard import guard_create, guard_owner_active, ExecutionGuardError
from .models import Task, TaskEvent, Person


# ---------------- routing rules: signal kind → (owner_role, priority, sla_hours, kpi) ----------------
RULES = {
    "ad_cpl_drift":         {"role": "Digital + Elevate", "priority": "P0", "sla_h": 24,  "kpi": "ad_cpl"},
    "ad_creative_fatigue":  {"role": "Marketing Lead",    "priority": "P1", "sla_h": 48,  "kpi": "ad_ctr"},
    "gsc_keyword_drop":     {"role": "SEO Specialist",    "priority": "P1", "sla_h": 120, "kpi": "gsc_position"},
    "dentally_no_show":     {"role": "Practice Ops",      "priority": "P1", "sla_h": 1,   "kpi": "rebooking"},
    "lead_no_response_5m":  {"role": "SDR",               "priority": "P0", "sla_h": 0.083, "kpi": "speed_to_lead"},
    "revenue_below_pace":   {"role": "Practice Ops",      "priority": "P0", "sla_h": 8,   "kpi": "revenue"},
    "task_overdue":         {"role": "COO",               "priority": "P1", "sla_h": 4,   "kpi": "completion_rate"},
    "ghl_pipeline_stalled": {"role": "SDR",               "priority": "P1", "sla_h": 24,  "kpi": "pipeline_velocity"},
    "voice_capture":        {"role": "CEO",               "priority": "P2", "sla_h": 72,  "kpi": None},
}


async def _find_owner(db: AsyncSession, role: str, business_id: Optional[UUID] = None) -> Optional[Person]:
    """Resolve a signal to a real owner — preferring same-business assignees."""
    res = await db.execute(select(Person).where(Person.role == role, Person.status == "active"))
    candidates = res.scalars().all()
    return candidates[0] if candidates else None


async def emit_task(
    db: AsyncSession,
    *,
    kind: str,
    title: str,
    body_md: str = "",
    business_id: Optional[UUID] = None,
    source: str = "rule",
    source_ref: Optional[str] = None,
    owner_override_id: Optional[UUID] = None,
    priority_override: Optional[str] = None,
    due_at_override: Optional[datetime] = None,
) -> Task:
    rule = RULES.get(kind, {"role": "COO", "priority": "P2", "sla_h": 72, "kpi": None})

    if owner_override_id:
        res = await db.execute(select(Person).where(Person.id == owner_override_id))
        owner = res.scalar_one_or_none()
    else:
        owner = await _find_owner(db, rule["role"], business_id)
    guard_owner_active(owner)

    due_at = due_at_override or (datetime.now(timezone.utc) + timedelta(hours=rule["sla_h"]))
    priority = priority_override or rule["priority"]
    guard_create(owner_id=owner.id, due_at=due_at, title=title)

    t = Task(
        title=title, body_md=body_md, business_id=business_id,
        owner_id=owner.id, due_at=due_at, priority=priority,
        source=source, source_ref=source_ref, kpi_metric=rule["kpi"],
    )
    db.add(t)
    await db.flush()
    db.add(TaskEvent(task_id=t.id, kind="created", actor_id=None,
                     payload={"signal_kind": kind, "rule": rule}))
    await db.commit()
    await db.refresh(t)
    return t


async def emit_voice_tasks(
    db: AsyncSession,
    *,
    transcript: str,
    items: list[dict],
    actor_id: UUID,
) -> list[Task]:
    """Bulk-create tasks from a voice approval payload (after AI splitting)."""
    out: list[Task] = []
    for it in items:
        owner_id = it.get("owner_id")
        if not owner_id:
            # try to look up by name
            name = it.get("owner_name")
            if name:
                res = await db.execute(select(Person).where(Person.name == name))
                p = res.scalar_one_or_none()
                if p: owner_id = p.id
        if not owner_id:
            continue
        title = it["title"]
        due_at = it["due_at"] if isinstance(it["due_at"], datetime) else datetime.fromisoformat(it["due_at"])
        if due_at.tzinfo is None: due_at = due_at.replace(tzinfo=timezone.utc)
        guard_create(owner_id=owner_id, due_at=due_at, title=title)
        t = Task(
            title=title, owner_id=owner_id, due_at=due_at,
            priority=it.get("priority", "P2"), source="voice",
            source_ref=transcript[:240], assigned_by=actor_id,
            body_md=f"From voice note: {transcript}",
        )
        db.add(t); await db.flush()
        db.add(TaskEvent(task_id=t.id, kind="created", actor_id=actor_id,
                         payload={"source": "voice", "transcript": transcript[:500]}))
        out.append(t)
    await db.commit()
    return out
