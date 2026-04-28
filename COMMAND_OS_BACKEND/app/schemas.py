"""Pydantic v2 contracts."""
from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class _Base(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ----------------- AUTH -----------------
class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    person_id: UUID
    name: str
    role: str
    scopes: dict


# ----------------- PEOPLE / BUSINESS -----------------
class BusinessOut(_Base):
    id: UUID
    slug: str
    name: str
    type: str
    color: Optional[str] = None
    target_monthly: Optional[float] = None
    location: Optional[str] = None


class PersonOut(_Base):
    id: UUID
    username: str
    name: str
    role: str
    email: Optional[str] = None
    color: Optional[str] = None
    whatsapp: Optional[str] = None
    status: str


class PersonIn(BaseModel):
    username: str
    name: str
    role: str
    password: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    color: Optional[str] = None


# ----------------- TASKS / PROJECTS -----------------
class TaskIn(BaseModel):
    """Every task must have owner + due_at — enforced by ExecutionGuard."""
    title: str = Field(min_length=2)
    body_md: Optional[str] = None
    business_id: Optional[UUID] = None
    owner_id: UUID                       # ExecutionGuard
    due_at: datetime                     # ExecutionGuard
    priority: str = "P2"
    project_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    source: str = "manual"
    source_ref: Optional[str] = None
    kpi_metric: Optional[str] = None


class TaskOut(_Base):
    id: UUID
    title: str
    body_md: Optional[str] = None
    business_id: Optional[UUID] = None
    owner_id: UUID
    assigned_by: Optional[UUID] = None
    status: str
    priority: str
    due_at: datetime
    source: str
    project_id: Optional[UUID] = None
    completion_proof_url: Optional[str] = None
    kpi_metric: Optional[str] = None
    kpi_delta: Optional[float] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TaskPatch(BaseModel):
    title: Optional[str] = None
    body_md: Optional[str] = None
    business_id: Optional[UUID] = None
    owner_id: Optional[UUID] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_at: Optional[datetime] = None
    completion_proof_url: Optional[str] = None
    kpi_delta: Optional[float] = None


class ProjectIn(BaseModel):
    name: str
    business_id: Optional[UUID] = None
    owner_id: UUID
    deadline: Optional[date] = None
    kpi_metric: Optional[str] = None
    kpi_target: Optional[float] = None


class ProjectOut(_Base):
    id: UUID
    name: str
    business_id: Optional[UUID] = None
    owner_id: Optional[UUID] = None
    deadline: Optional[date] = None
    kpi_metric: Optional[str] = None
    kpi_target: Optional[float] = None
    progress_pct: int
    status: str


# ----------------- VOICE → TASKS -----------------
class VoiceSplitIn(BaseModel):
    transcript: str
    default_owner_id: Optional[UUID] = None


class VoiceTaskItem(BaseModel):
    title: str
    owner_id: Optional[UUID] = None
    owner_name: Optional[str] = None
    business_slug: Optional[str] = None
    priority: str = "P2"
    due_at: datetime


class VoiceSplitOut(BaseModel):
    transcript: str
    items: list[VoiceTaskItem]
    via_llm: bool


class VoiceApproveIn(BaseModel):
    transcript: str
    items: list[VoiceTaskItem]


# ----------------- COMMERCIAL -----------------
class RevenueIn(BaseModel):
    business_id: UUID
    date: date
    gross: float
    net: Optional[float] = None
    source: str = "manual"


class RevenueOut(_Base):
    id: UUID
    business_id: UUID
    date: date
    gross: float
    net: Optional[float] = None
    source: str


# ----------------- LEADS -----------------
class LeadIn(BaseModel):
    business_id: UUID
    source: Optional[str] = None
    persona: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    stage: str = "lead"
    value_est: Optional[float] = None
    owner_id: Optional[UUID] = None


class LeadOut(_Base):
    id: UUID
    business_id: UUID
    source: Optional[str] = None
    persona: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    stage: str
    value_est: Optional[float] = None
    owner_id: Optional[UUID] = None
    created_at: datetime
    last_touched_at: datetime


# ----------------- AI -----------------
class DirectiveOut(_Base):
    id: UUID
    person_id: Optional[UUID] = None
    business_id: Optional[UUID] = None
    kind: str
    text: str
    action_url: Optional[str] = None
    score: float
    generated_at: datetime
    dismissed_at: Optional[datetime] = None
    task_id: Optional[UUID] = None


class WarningOut(_Base):
    id: UUID
    business_id: Optional[UUID] = None
    kind: str
    severity: int
    text: str
    evidence: dict
    opened_at: datetime
    closed_at: Optional[datetime] = None


class AskBrainIn(BaseModel):
    question: str
    business_id: Optional[UUID] = None


class AskBrainOut(BaseModel):
    answer: str
    used_llm: bool


# ----------------- AUTOMATION -----------------
class RuleIn(BaseModel):
    name: str
    trigger_kind: str
    trigger_config: dict = {}
    action_kind: str
    action_config: dict = {}
    enabled: bool = True


class RuleOut(_Base):
    id: UUID
    name: str
    trigger_kind: str
    trigger_config: dict
    action_kind: str
    action_config: dict
    enabled: bool
    last_fired_at: Optional[datetime] = None


# ----------------- INTEGRATIONS -----------------
class IntegStatus(BaseModel):
    provider: str
    connected: bool
    expires_at: Optional[datetime] = None
    meta: dict = {}
