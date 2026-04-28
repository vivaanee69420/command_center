"""Tasks — CRUD + status moves, all guarded by ExecutionGuard."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import current_user
from ..execution_guard import ExecutionGuardError, guard_create, guard_owner_active, guard_update
from ..models import Person, Task, TaskEvent
from ..schemas import TaskIn, TaskOut, TaskPatch

router = APIRouter()


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    owner_id: Optional[UUID] = Query(None),
    business_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    me_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    stmt = select(Task)
    if me_only or owner_id == p.id:
        stmt = stmt.where(Task.owner_id == p.id)
    elif owner_id is not None:
        stmt = stmt.where(Task.owner_id == owner_id)
    if business_id:
        stmt = stmt.where(Task.business_id == business_id)
    if status:
        stmt = stmt.where(Task.status == status)
    stmt = stmt.order_by(Task.due_at.asc()).limit(500)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(body: TaskIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    # ExecutionGuard
    try:
        guard_create(owner_id=body.owner_id, due_at=body.due_at, title=body.title)
    except ExecutionGuardError as e:
        raise HTTPException(422, str(e))
    owner = (await db.execute(select(Person).where(Person.id == body.owner_id))).scalar_one_or_none()
    try:
        guard_owner_active(owner)
    except ExecutionGuardError as e:
        raise HTTPException(422, str(e))

    t = Task(**body.model_dump(), assigned_by=p.id)
    db.add(t); await db.flush()
    db.add(TaskEvent(task_id=t.id, kind="created", actor_id=p.id, payload={"by": str(p.id)}))
    await db.commit(); await db.refresh(t)
    return t


@router.patch("/{task_id}", response_model=TaskOut)
async def patch_task(task_id: UUID, body: TaskPatch, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    t = (await db.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not t: raise HTTPException(404, "task not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(t, k, v)

    # If moving to done, enforce closure invariant
    if t.status == "done":
        try:
            guard_update(status=t.status, completion_proof_url=t.completion_proof_url, kpi_delta=t.kpi_delta)
        except ExecutionGuardError as e:
            raise HTTPException(422, str(e))
        t.approved_by = p.id
        t.approved_at = datetime.utcnow()

    db.add(TaskEvent(task_id=t.id, kind="patched", actor_id=p.id, payload=data))
    await db.commit(); await db.refresh(t)
    return t


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    t = (await db.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not t: raise HTTPException(404, "task not found")
    await db.delete(t); await db.commit()
