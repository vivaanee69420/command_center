"""Daily Routines: templates + completion logs."""
from datetime import date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import current_user
from ..models import Person, RoutineTemplate, RoutineLog
from ..schemas import (
    RoutineTemplateOut, RoutineTemplateIn,
    RoutineLogOut, RoutineLogIn,
)

router = APIRouter()


# ---------------- Templates ----------------
@router.get("/routines/templates", response_model=list[RoutineTemplateOut])
async def list_templates(
    role: str = Query(None),
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    stmt = select(RoutineTemplate).order_by(RoutineTemplate.time_local)
    if role:
        stmt = stmt.where(RoutineTemplate.role == role)
    return (await db.execute(stmt)).scalars().all()


@router.post("/routines/templates", response_model=RoutineTemplateOut, status_code=201)
async def create_template(
    body: RoutineTemplateIn,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO/COO can manage routine templates")
    rt = RoutineTemplate(**body.model_dump())
    db.add(rt)
    await db.commit()
    await db.refresh(rt)
    return rt


@router.delete("/routines/templates/{tid}", status_code=204)
async def delete_template(
    tid: UUID,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO/COO can manage routine templates")
    rt = (await db.execute(select(RoutineTemplate).where(RoutineTemplate.id == tid))).scalar_one_or_none()
    if not rt:
        raise HTTPException(404, "template not found")
    await db.delete(rt)
    await db.commit()


# ---------------- Logs ----------------
@router.get("/routines/logs", response_model=list[RoutineLogOut])
async def list_logs(
    date_val: date = Query(None, alias="date"),
    person_id: UUID = Query(None),
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    stmt = select(RoutineLog).order_by(RoutineLog.date.desc()).limit(500)
    if date_val:
        stmt = stmt.where(RoutineLog.date == date_val)
    if person_id:
        stmt = stmt.where(RoutineLog.person_id == person_id)
    return (await db.execute(stmt)).scalars().all()


@router.post("/routines/logs", response_model=RoutineLogOut, status_code=201)
async def log_routine(
    body: RoutineLogIn,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    # Check if already logged
    existing = (await db.execute(
        select(RoutineLog).where(and_(
            RoutineLog.person_id == p.id,
            RoutineLog.template_id == body.template_id,
            RoutineLog.date == body.date,
        ))
    )).scalar_one_or_none()

    if existing:
        # Toggle: if already completed, uncomplete; else complete
        if existing.completed_at:
            existing.completed_at = None
            existing.notes = None
        else:
            existing.completed_at = datetime.utcnow()
            existing.notes = body.notes
        await db.commit()
        await db.refresh(existing)
        return existing

    rl = RoutineLog(
        person_id=p.id,
        template_id=body.template_id,
        date=body.date,
        completed_at=datetime.utcnow(),
        notes=body.notes,
    )
    db.add(rl)
    await db.commit()
    await db.refresh(rl)
    return rl
