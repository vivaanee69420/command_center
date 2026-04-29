"""Core CRUD: businesses, people, projects, revenue, leads."""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import current_user
from ..models import Business, Lead, Person, Project, RevenueSnapshot, Task
from ..schemas import (
    BusinessOut, LeadIn, LeadOut, LeadPatch, PersonIn, PersonOut, ProjectIn, ProjectOut, ProjectPatch,
    RevenueIn, RevenueOut,
)
from ..security import hash_password

router = APIRouter()


# ---------------- Businesses ----------------
@router.get("/businesses", response_model=list[BusinessOut])
async def list_businesses(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(select(Business).order_by(Business.name))).scalars().all()


@router.get("/businesses/{slug}", response_model=BusinessOut)
async def get_business(slug: str, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    b = (await db.execute(select(Business).where(Business.slug == slug))).scalar_one_or_none()
    if not b: raise HTTPException(404, "business not found")
    return b


# ---------------- People ----------------
@router.get("/people", response_model=list[PersonOut])
async def list_people(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(select(Person).order_by(Person.name))).scalars().all()


@router.post("/people", response_model=PersonOut, status_code=201)
async def create_person(body: PersonIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO/COO can add people")
    person = Person(
        username=body.username.lower().strip(),
        name=body.name, role=body.role, email=body.email,
        password_hash=hash_password(body.password),
        whatsapp=body.whatsapp, color=body.color, status="active",
    )
    db.add(person); await db.commit(); await db.refresh(person)
    return person


# ---------------- Projects ----------------
@router.get("/projects", response_model=list[ProjectOut])
async def list_projects(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    return (await db.execute(select(Project).order_by(Project.deadline))).scalars().all()


@router.post("/projects", response_model=ProjectOut, status_code=201)
async def create_project(body: ProjectIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    pr = Project(**body.model_dump(), status="active")
    db.add(pr); await db.commit(); await db.refresh(pr)
    return pr


@router.patch("/projects/{pid}", response_model=ProjectOut)
async def patch_project(pid: UUID, body: ProjectPatch, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    pr = (await db.execute(select(Project).where(Project.id == pid))).scalar_one_or_none()
    if not pr: raise HTTPException(404, "project not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(pr, k, v)
    await db.commit(); await db.refresh(pr)
    return pr


@router.delete("/projects/{pid}", status_code=204)
async def delete_project(pid: UUID, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    pr = (await db.execute(select(Project).where(Project.id == pid))).scalar_one_or_none()
    if not pr: raise HTTPException(404, "project not found")
    await db.delete(pr); await db.commit()


# ---------------- Revenue ----------------
@router.get("/revenue", response_model=list[RevenueOut])
async def list_revenue(business_id: UUID = Query(None), db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    stmt = select(RevenueSnapshot).order_by(RevenueSnapshot.date.desc()).limit(120)
    if business_id: stmt = stmt.where(RevenueSnapshot.business_id == business_id)
    return (await db.execute(stmt)).scalars().all()


@router.post("/revenue", response_model=RevenueOut, status_code=201)
async def add_revenue(body: RevenueIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    rs = RevenueSnapshot(**body.model_dump())
    db.add(rs); await db.commit(); await db.refresh(rs)
    return rs


# ---------------- Leads ----------------
@router.get("/leads", response_model=list[LeadOut])
async def list_leads(stage: str = Query(None), db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    stmt = select(Lead).order_by(Lead.last_touched_at.desc()).limit(500)
    if stage: stmt = stmt.where(Lead.stage == stage)
    return (await db.execute(stmt)).scalars().all()


@router.post("/leads", response_model=LeadOut, status_code=201)
async def add_lead(body: LeadIn, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    L = Lead(**body.model_dump())
    db.add(L); await db.commit(); await db.refresh(L)
    return L


@router.patch("/leads/{lid}", response_model=LeadOut)
async def patch_lead(lid: UUID, body: LeadPatch, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    lead = (await db.execute(select(Lead).where(Lead.id == lid))).scalar_one_or_none()
    if not lead:
        raise HTTPException(404, "lead not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(lead, k, v)
    lead.last_touched_at = datetime.utcnow()
    await db.commit()
    await db.refresh(lead)
    return lead


@router.delete("/leads/{lid}", status_code=204)
async def delete_lead(lid: UUID, db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    lead = (await db.execute(select(Lead).where(Lead.id == lid))).scalar_one_or_none()
    if not lead:
        raise HTTPException(404, "lead not found")
    await db.delete(lead)
    await db.commit()


# ---------------- Today's plate ----------------
@router.get("/today", response_model=dict)
async def today(db: AsyncSession = Depends(get_db), p: Person = Depends(current_user)):
    """Personalised plate: tasks due today + overdue + this-week preview."""
    now = datetime.utcnow()
    rows = (await db.execute(
        select(Task).where(Task.owner_id == p.id, Task.status != "done").order_by(Task.due_at.asc())
    )).scalars().all()
    due_today, overdue, this_week, later = [], [], [], []
    for t in rows:
        diff = (t.due_at.replace(tzinfo=None) - now).total_seconds() / 86400
        item = {"id": str(t.id), "title": t.title, "priority": t.priority,
                "due_at": t.due_at.isoformat(), "status": t.status}
        if diff < -0.001: overdue.append(item)
        elif diff < 1:    due_today.append(item)
        elif diff < 7:    this_week.append(item)
        else:             later.append(item)
    return {
        "person": {"id": str(p.id), "name": p.name, "role": p.role},
        "as_of": now.isoformat(),
        "overdue": overdue,
        "today": due_today[:5],
        "this_week": this_week[:3],
        "later": later[:3],
        "total_open": len(rows),
    }
