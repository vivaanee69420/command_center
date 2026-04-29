"""SQLAlchemy 2.0 ORM — mirrors migrations/001_init.sql."""
from __future__ import annotations
from datetime import datetime, date, time
from typing import Optional
import uuid

from sqlalchemy import (
    String, Integer, Numeric, Boolean, Date, Time, DateTime, ForeignKey, Text, JSON,
    UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, INET
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _id():
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


def _ts():
    return mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


# ----------------- ENTITIES & PEOPLE -----------------
class Business(Base):
    __tablename__ = "business"
    id = _id()
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"))
    color: Mapped[Optional[str]] = mapped_column(Text)
    target_monthly: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    location: Mapped[Optional[str]] = mapped_column(Text)
    created_at = _ts()
    updated_at = _ts()


class Person(Base):
    __tablename__ = "person"
    id = _id()
    username: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    scope_layers: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    scope_modules: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    whatsapp: Mapped[Optional[str]] = mapped_column(Text)
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    hourly_rate: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    output_only: Mapped[bool] = mapped_column(Boolean, default=False)
    color: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="active")
    created_at = _ts()


class PersonBusiness(Base):
    __tablename__ = "person_business"
    person_id = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"), primary_key=True)
    business_id = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"), primary_key=True)


# ----------------- EXECUTION ENGINE -----------------
class Project(Base):
    __tablename__ = "project"
    id = _id()
    name: Mapped[str] = mapped_column(Text, nullable=False)
    business_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"))
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    deadline: Mapped[Optional[date]] = mapped_column(Date)
    kpi_metric: Mapped[Optional[str]] = mapped_column(Text)
    kpi_target: Mapped[Optional[float]] = mapped_column(Numeric)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(Text, default="planning")
    created_at = _ts()


class Task(Base):
    __tablename__ = "task"
    id = _id()
    title: Mapped[str] = mapped_column(Text, nullable=False)
    body_md: Mapped[Optional[str]] = mapped_column(Text)
    business_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"))
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"), nullable=False)
    assigned_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    status: Mapped[str] = mapped_column(Text, default="backlog")
    priority: Mapped[str] = mapped_column(Text, default="P2")
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source: Mapped[str] = mapped_column(Text, default="manual")
    source_ref: Mapped[Optional[str]] = mapped_column(Text)
    completion_proof_url: Mapped[Optional[str]] = mapped_column(Text)
    kpi_metric: Mapped[Optional[str]] = mapped_column(Text)
    kpi_delta: Mapped[Optional[float]] = mapped_column(Numeric)
    parent_task_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("task.id"))
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("project.id"))
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at = _ts()
    updated_at = _ts()


class TaskEvent(Base):
    __tablename__ = "task_event"
    id = _id()
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("task.id"), nullable=False)
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    at = _ts()


# ----------------- COMMERCIAL -----------------
class RevenueSnapshot(Base):
    __tablename__ = "revenue_snapshot"
    id = _id()
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    gross: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    net: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    source: Mapped[str] = mapped_column(Text, nullable=False)
    source_ref: Mapped[Optional[str]] = mapped_column(Text)


# ----------------- CRM -----------------
class Lead(Base):
    __tablename__ = "lead"
    id = _id()
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(Text)
    persona: Mapped[Optional[str]] = mapped_column(Text)
    name: Mapped[Optional[str]] = mapped_column(Text)
    email: Mapped[Optional[str]] = mapped_column(Text)
    phone: Mapped[Optional[str]] = mapped_column(Text)
    stage: Mapped[str] = mapped_column(Text, default="lead")
    value_est: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    ghl_contact_id: Mapped[Optional[str]] = mapped_column(Text)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    created_at = _ts()
    last_touched_at = _ts()


# ----------------- AI BRAIN -----------------
class AiDirective(Base):
    __tablename__ = "ai_directive"
    id = _id()
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    business_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"))
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    action_url: Mapped[Optional[str]] = mapped_column(Text)
    score: Mapped[float] = mapped_column(Numeric(4, 3), default=0)
    generated_at = _ts()
    dismissed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    task_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("task.id"))


class AiWarning(Base):
    __tablename__ = "ai_warning"
    id = _id()
    business_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id"))
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=1)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[dict] = mapped_column(JSONB, default=dict)
    opened_at = _ts()
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


# ----------------- INTEGRATIONS -----------------
class OAuthToken(Base):
    __tablename__ = "oauth_token"
    id = _id()
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    provider: Mapped[str] = mapped_column(Text, nullable=False)
    access_token_enc: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_enc: Mapped[Optional[str]] = mapped_column(Text)
    scope: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)


# ----------------- AUTOMATION -----------------
class AutomationRule(Base):
    __tablename__ = "automation_rule"
    id = _id()
    name: Mapped[str] = mapped_column(Text, nullable=False)
    trigger_kind: Mapped[str] = mapped_column(Text, nullable=False)
    trigger_config: Mapped[dict] = mapped_column(JSONB, default=dict)
    action_kind: Mapped[str] = mapped_column(Text, nullable=False)
    action_config: Mapped[dict] = mapped_column(JSONB, default=dict)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"))
    created_at = _ts()
    last_fired_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


# ----------------- MARKETING / ADS -----------------
class AdAccount(Base):
    __tablename__ = "ad_account"
    id = _id()
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("business.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str] = mapped_column(Text, nullable=False)
    account_id: Mapped[str] = mapped_column(Text, nullable=False)
    oauth_token_enc: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("platform", "account_id"),)


class AdCampaign(Base):
    __tablename__ = "ad_campaign"
    id = _id()
    ad_account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ad_account.id", ondelete="CASCADE"), nullable=False)
    ext_id: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[Optional[str]] = mapped_column(Text)
    daily_budget: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("ad_account_id", "ext_id"),)


class AdMetric(Base):
    __tablename__ = "ad_metric"
    id = _id()
    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ad_campaign.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    spend: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    conversions: Mapped[int] = mapped_column(Integer, default=0)
    cpa: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    roas: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    __table_args__ = (UniqueConstraint("campaign_id", "date"),)


# ----------------- DAILY ROUTINES -----------------
class RoutineTemplate(Base):
    __tablename__ = "routine_template"
    id = _id()
    role: Mapped[str] = mapped_column(Text, nullable=False)
    time_local: Mapped[time] = mapped_column(Time, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    week_phase: Mapped[Optional[int]] = mapped_column(Integer)


class RoutineLog(Base):
    __tablename__ = "routine_log"
    id = _id()
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"), nullable=False)
    template_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("routine_template.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    voice_url: Mapped[Optional[str]] = mapped_column(Text)
    __table_args__ = (UniqueConstraint("person_id", "template_id", "date"),)


# ----------------- NOTIFICATIONS -----------------
class Notification(Base):
    __tablename__ = "notification"
    id = _id()
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("person.id"), nullable=False)
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text)
    url: Mapped[Optional[str]] = mapped_column(Text)
    channels: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at = _ts()
