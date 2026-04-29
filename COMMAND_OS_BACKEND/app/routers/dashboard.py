"""Group Dashboard endpoints — summary, AI CEO insights, AI team task generation."""
import json
import logging
from datetime import datetime, timedelta, date, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func, and_, cast
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db import get_db
from ..deps import current_user
from ..models import (
    Business, Person, Task, Lead, RevenueSnapshot,
    AiDirective, AiWarning, TaskEvent, AutomationRule,
)
from ..task_engine import emit_task

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class AiCeoInsightsRequest(BaseModel):
    context: dict[str, Any] = {}
    focusArea: str = "overall"


class AiCeoInsightsResponse(BaseModel):
    success: bool
    insights: dict[str, Any]


class GenerateTeamTasksRequest(BaseModel):
    context: dict[str, Any] = {}
    targetDay: Optional[str] = None  # ISO date string, defaults to today


class GenerateTeamTasksResponse(BaseModel):
    success: bool
    tasksGenerated: int
    taskTitles: list[str] = []


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


def _week_start_utc() -> date:
    today = _today_utc()
    return today - timedelta(days=today.weekday())


def _month_start_utc() -> date:
    today = _today_utc()
    return today.replace(day=1)


def _to_float(val: Any) -> float:
    """Safely coerce SQLAlchemy Decimal / None to float."""
    if val is None:
        return 0.0
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0


async def _call_anthropic(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> Optional[str]:
    """
    Call the Anthropic Messages API and return the text content.
    Returns None on any failure so callers can fall back to defaults.
    """
    cfg = settings()
    if not cfg.ANTHROPIC_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": cfg.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": cfg.AI_BRAIN_MODEL,
                    "max_tokens": max_tokens,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": user_prompt}],
                },
            )
            resp.raise_for_status()
            return resp.json()["content"][0]["text"]
    except Exception as exc:
        logger.warning("Anthropic API call failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Endpoint 1 — GET /dashboard/summary
# ---------------------------------------------------------------------------

@router.get("/summary")
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
) -> dict[str, Any]:
    """
    Aggregated dashboard metrics:
    revenue, leads, tasks, business metrics, team performance, alerts.
    Falls back to sensible seed data when the DB is empty.
    """
    today = _today_utc()
    week_start = _week_start_utc()
    month_start = _month_start_utc()
    now_utc = datetime.now(timezone.utc)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)
    prev_month_end = month_start - timedelta(days=1)
    last_week_start = week_start - timedelta(days=7)
    last_week_end = week_start - timedelta(days=1)
    pending_statuses = ("backlog", "todo", "in_progress", "review")
    booked_stages = ("booked", "appointment", "confirmed")
    is_admin = p.role in ("CEO", "COO")

    # ---- Single raw SQL query for all scalar KPIs (1 round-trip) ----
    from sqlalchemy import text as _text
    kpi_sql = _text("""
        SELECT
            (SELECT COALESCE(SUM(gross),0) FROM revenue_snapshot WHERE date >= :ms AND date <= :td) AS rev_month,
            (SELECT COALESCE(SUM(gross),0) FROM revenue_snapshot WHERE date >= :pms AND date <= :pme) AS rev_prev,
            (SELECT COALESCE(SUM(target_monthly),0) FROM business) AS total_target,
            (SELECT COUNT(*) FROM lead WHERE created_at::date = :td) AS leads_today,
            (SELECT COUNT(*) FROM lead WHERE created_at::date >= :ws) AS leads_week,
            (SELECT COUNT(*) FROM lead WHERE created_at::date >= :lws AND created_at::date <= :lwe) AS leads_last_week,
            (SELECT COUNT(*) FROM lead WHERE stage IN ('booked','appointment','confirmed') AND created_at::date = :td) AS bookings_today,
            (SELECT COUNT(*) FROM lead WHERE stage IN ('booked','appointment','confirmed') AND created_at::date >= :ws) AS bookings_week
    """)
    try:
        kpi_row = (await db.execute(kpi_sql, {
            "ms": month_start, "td": today, "pms": prev_month_start, "pme": prev_month_end,
            "ws": week_start, "lws": last_week_start, "lwe": last_week_end,
        })).one()
        rev_month = float(kpi_row[0])
        rev_prev = float(kpi_row[1])
        total_target = float(kpi_row[2]) or 1_000_000.0
        leads_today = int(kpi_row[3])
        leads_week = int(kpi_row[4])
        leads_last_week = int(kpi_row[5])
        bookings_today = int(kpi_row[6])
        bookings_week = int(kpi_row[7])
    except Exception:
        rev_month, rev_prev, total_target = 0.0, 0.0, 1_000_000.0
        leads_today, leads_week, leads_last_week = 0, 0, 0
        bookings_today, bookings_week = 0, 0

    # ---- Task counts (1 query with FILTER) ----
    try:
        task_owner_clause = "" if is_admin else f"AND owner_id = '{p.id}'"
        task_sql = _text(f"""
            SELECT
                COUNT(*) FILTER (WHERE status = 'done') AS completed,
                COUNT(*) FILTER (WHERE status IN ('backlog','todo','in_progress','review')) AS pending,
                COUNT(*) FILTER (WHERE status IN ('backlog','todo','in_progress','review') AND due_at < :now) AS overdue
            FROM task WHERE 1=1 {task_owner_clause}
        """)
        task_row = (await db.execute(task_sql, {"now": now_utc})).one()
        tasks_completed, tasks_pending, tasks_overdue = int(task_row[0]), int(task_row[1]), int(task_row[2])
    except Exception:
        tasks_completed, tasks_pending, tasks_overdue = 0, 0, 0

    rev_trend = round(((rev_month - rev_prev) / rev_prev * 100) if rev_prev else 0, 1)
    leads_trend = round(((leads_week - leads_last_week) / leads_last_week * 100) if leads_last_week else 0, 1)
    conversion_rate = round((bookings_week / leads_week * 100) if leads_week else 0, 1)

    # ---- Business metrics (1 raw SQL query) ----
    business_metrics: list[dict[str, Any]] = []
    try:
        biz_sql = _text("""
            SELECT b.id, b.name, b.slug, b.type, b.color, b.target_monthly,
                COALESCE(r.rev, 0) AS revenue,
                COALESCE(l.cnt, 0) AS leads_week,
                COALESCE(t.cnt, 0) AS active_tasks
            FROM business b
            LEFT JOIN (
                SELECT business_id, SUM(gross) AS rev FROM revenue_snapshot
                WHERE date >= :ms AND date <= :td GROUP BY business_id
            ) r ON r.business_id = b.id
            LEFT JOIN (
                SELECT business_id, COUNT(*) AS cnt FROM lead
                WHERE created_at::date >= :ws GROUP BY business_id
            ) l ON l.business_id = b.id
            LEFT JOIN (
                SELECT business_id, COUNT(*) AS cnt FROM task
                WHERE status IN ('backlog','todo','in_progress','review') GROUP BY business_id
            ) t ON t.business_id = b.id
            ORDER BY b.name
        """)
        biz_rows = (await db.execute(biz_sql, {"ms": month_start, "td": today, "ws": week_start})).all()
        for row in biz_rows:
            biz_target = float(row[5] or 0)
            biz_rev = float(row[6])
            attainment = round((biz_rev / biz_target * 100) if biz_target else 0, 1)
            business_metrics.append({
                "id": str(row[0]), "name": row[1], "slug": row[2], "type": row[3],
                "color": row[4], "revenue": biz_rev, "target": biz_target,
                "attainmentPct": attainment, "leadsThisWeek": int(row[7]),
                "activeTasks": int(row[8]),
            })
    except Exception as exc:
        logger.warning("business metrics query failed: %s", exc)

    # ---- Team performance (1 raw SQL query) ----
    team_performance: list[dict[str, Any]] = []
    try:
        team_sql = _text("""
            SELECT p.id, p.name, p.role, p.color,
                COALESCE(t.done, 0) AS done,
                COALESCE(t.total, 0) AS total,
                COALESCE(t.overdue, 0) AS overdue
            FROM person p
            LEFT JOIN (
                SELECT owner_id,
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'done') AS done,
                    COUNT(*) FILTER (WHERE status IN ('backlog','todo','in_progress','review') AND due_at < :now) AS overdue
                FROM task GROUP BY owner_id
            ) t ON t.owner_id = p.id
            WHERE p.status = 'active'
            ORDER BY p.name
        """)
        team_rows = (await db.execute(team_sql, {"now": now_utc})).all()
        for row in team_rows:
            done_count, total_count, overdue_person = int(row[4]), int(row[5]), int(row[6])
            completion_rate = round((done_count / total_count * 100) if total_count else 0, 1)
            team_performance.append({
                "id": str(row[0]), "name": row[1], "role": row[2], "color": row[3],
                "tasksCompleted": done_count, "tasksTotal": total_count,
                "tasksPending": total_count - done_count, "tasksOverdue": overdue_person,
                "completionRate": completion_rate,
            })
    except Exception as exc:
        logger.warning("team performance query failed: %s", exc)

    # ---- AI warnings (1 query) ----
    ai_warnings = []
    try:
        ai_warnings = (await db.execute(
            select(AiWarning).where(AiWarning.closed_at.is_(None)).order_by(AiWarning.severity.desc()).limit(5)
        )).scalars().all()
    except Exception:
        pass

    # ---- Dynamic alerts (no extra queries — uses data already fetched) ----
    alerts: list[dict[str, Any]] = []
    if tasks_overdue > 0:
        alerts.append({
            "type": "warning", "category": "tasks",
            "message": f"{tasks_overdue} task{'s' if tasks_overdue != 1 else ''} overdue — immediate action required.",
            "severity": "high" if tasks_overdue >= 5 else "medium",
        })
    if leads_today < 10:
        alerts.append({
            "type": "info", "category": "leads",
            "message": f"Only {leads_today} lead{'s' if leads_today != 1 else ''} captured today. Check ad performance.",
            "severity": "medium" if leads_today < 5 else "low",
        })
    if rev_month < (total_target * 0.5) and today.day >= 15:
        alerts.append({
            "type": "critical", "category": "revenue",
            "message": f"Revenue at {round(rev_month / total_target * 100, 1)}% of monthly target past mid-month.",
            "severity": "high",
        })
    for w in ai_warnings:
        alerts.append({
            "type": "ai_warning", "category": w.kind, "message": w.text,
            "severity": "high" if w.severity >= 3 else "medium" if w.severity == 2 else "low",
        })

    return {
        "revenue": {
            "month": rev_month,
            "target": total_target,
            "trend": rev_trend,
            "attainmentPct": round((rev_month / total_target * 100) if total_target else 0, 1),
        },
        "leads": {
            "today": leads_today,
            "week": leads_week,
            "trend": leads_trend,
        },
        "bookings": {
            "today": bookings_today,
            "week": bookings_week,
            "conversionRate": conversion_rate,
        },
        "adSpend": {
            # Populated from ad provider workers when connected; stub for now
            "month": 0,
            "roi": 0,
        },
        "tasks": {
            "completed": tasks_completed,
            "pending": tasks_pending,
            "overdue": tasks_overdue,
        },
        "businessMetrics": business_metrics,
        "teamPerformance": team_performance,
        "alerts": alerts,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Endpoint 2 — POST /dashboard/ai-ceo/insights
# ---------------------------------------------------------------------------

_AI_CEO_SYSTEM = """\
You are the AI CEO of GM Dental Group's Command Center OS — a multi-site premium dental group.
Your role: deliver razor-sharp, data-driven executive insights. Be direct, specific, and action-oriented.
Respond ONLY with valid JSON matching this exact schema (no markdown fences, no prose outside JSON):
{
  "executiveSummary": "<2-3 sentence high-level read of the business>",
  "urgentActions": [
    {"action": "<specific action>", "owner": "<role>", "deadline": "<timeframe>", "impact": "<expected outcome>"}
  ],
  "weeklyPriorities": [
    {"priority": "<strategic priority>", "rationale": "<why this week>", "kpi": "<metric to track>"}
  ],
  "taskRecommendations": [
    {"title": "<task title>", "assignTo": "<role>", "dueIn": "<hours>", "priority": "<P0|P1|P2>"}
  ],
  "riskAlerts": [
    {"risk": "<risk description>", "likelihood": "<high|medium|low>", "mitigation": "<recommended action>"}
  ],
  "growthOpportunities": [
    {"opportunity": "<opportunity>", "revenueImpact": "<estimated £ or %>", "effort": "<low|medium|high>"}
  ]
}
Limit each array to 3-5 items. Use British English. Ground every insight in the metrics provided.\
"""


@router.post("/ai-ceo/insights", response_model=AiCeoInsightsResponse)
async def ai_ceo_insights(
    body: AiCeoInsightsRequest,
    p: Person = Depends(current_user),
) -> AiCeoInsightsResponse:
    """
    Generate AI CEO strategic insights from the provided dashboard context.
    Falls back to structured placeholder insights if the LLM is unavailable.
    """
    metrics = body.context.get("metrics", {})
    team = body.context.get("teamPerformance", [])
    alerts = body.context.get("alerts", [])

    user_prompt = (
        f"Focus area: {body.focusArea}\n\n"
        f"Current metrics:\n{json.dumps(metrics, indent=2)}\n\n"
        f"Team performance snapshot:\n{json.dumps(team[:10], indent=2)}\n\n"
        f"Active alerts:\n{json.dumps(alerts[:10], indent=2)}\n\n"
        "Generate comprehensive executive insights based on the above data."
    )

    raw = await _call_anthropic(_AI_CEO_SYSTEM, user_prompt, max_tokens=1800)

    if raw:
        try:
            # Strip any accidental markdown code fences
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = "\n".join(cleaned.split("\n")[1:])
            if cleaned.endswith("```"):
                cleaned = "\n".join(cleaned.split("\n")[:-1])
            insights = json.loads(cleaned)
            return AiCeoInsightsResponse(success=True, insights=insights)
        except json.JSONDecodeError as exc:
            logger.warning("AI CEO response was not valid JSON: %s — %s", exc, raw[:200])

    # Graceful fallback — structured placeholder
    fallback_insights: dict[str, Any] = {
        "executiveSummary": (
            "Dashboard data has been loaded. Connect the Anthropic API key to unlock "
            "real-time AI CEO insights tailored to GM Dental Group's current performance."
        ),
        "urgentActions": [
            {
                "action": "Review overdue tasks and reassign blockers",
                "owner": "COO",
                "deadline": "Today",
                "impact": "Restore execution velocity across all practices",
            }
        ],
        "weeklyPriorities": [
            {
                "priority": "Lead follow-up within 5 minutes of capture",
                "rationale": "Speed-to-lead is the single highest-leverage conversion lever",
                "kpi": "Speed-to-lead median (minutes)",
            }
        ],
        "taskRecommendations": [
            {
                "title": "Audit this week's lead response times",
                "assignTo": "SDR",
                "dueIn": "24",
                "priority": "P1",
            }
        ],
        "riskAlerts": [
            {
                "risk": "No Anthropic API key configured — AI Brain is offline",
                "likelihood": "high",
                "mitigation": "Add ANTHROPIC_API_KEY to .env and restart the API container",
            }
        ],
        "growthOpportunities": [
            {
                "opportunity": "Activate automated lead nurture sequences via GHL",
                "revenueImpact": "15-25% lift in booking conversion",
                "effort": "medium",
            }
        ],
    }
    return AiCeoInsightsResponse(success=True, insights=fallback_insights)


# ---------------------------------------------------------------------------
# Endpoint 3 — POST /dashboard/ai-ceo/generate-team-tasks
# ---------------------------------------------------------------------------

_TASK_GEN_SYSTEM = """\
You are the AI CEO of GM Dental Group's Command Center OS.
Generate a precise daily task list for the team based on the business context provided.
Respond ONLY with valid JSON — an array of task objects, no markdown, no prose:
[
  {
    "title": "<concise task title>",
    "body_md": "<detailed task description in markdown>",
    "assignRole": "<exact role name: CEO|COO|Marketing Lead|Digital + Elevate|Practice Ops|Lab BD|SDR|SEO Specialist|Social Specialist|General Outsourcer>",
    "priority": "<P0|P1|P2>",
    "dueInHours": <integer hours from now>,
    "kind": "<ad_cpl_drift|ad_creative_fatigue|gsc_keyword_drop|dentally_no_show|lead_no_response_5m|revenue_below_pace|task_overdue|ghl_pipeline_stalled|voice_capture>"
  }
]
Generate 4-7 tasks. Ensure every task has a clear owner role and deadline. Be specific about dental group operations.\
"""


@router.post("/ai-ceo/generate-team-tasks", response_model=GenerateTeamTasksResponse)
async def generate_team_tasks(
    body: GenerateTeamTasksRequest,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
) -> GenerateTeamTasksResponse:
    """
    Use the AI CEO to generate team tasks from context, then persist them via TaskEngine.
    Only CEO and COO may trigger this endpoint.
    """
    if p.role not in ("CEO", "COO"):
        raise HTTPException(403, "only CEO or COO can generate AI team tasks")

    target_day = body.targetDay or _today_utc().isoformat()
    metrics = body.context.get("metrics", {})
    team = body.context.get("teamPerformance", [])
    alerts = body.context.get("alerts", [])

    user_prompt = (
        f"Target day: {target_day}\n\n"
        f"Business metrics:\n{json.dumps(metrics, indent=2)}\n\n"
        f"Team performance:\n{json.dumps(team[:10], indent=2)}\n\n"
        f"Active alerts:\n{json.dumps(alerts[:10], indent=2)}\n\n"
        "Generate the optimal task list for the team today."
    )

    raw = await _call_anthropic(_TASK_GEN_SYSTEM, user_prompt, max_tokens=2000)

    task_specs: list[dict[str, Any]] = []
    if raw:
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = "\n".join(cleaned.split("\n")[1:])
            if cleaned.endswith("```"):
                cleaned = "\n".join(cleaned.split("\n")[:-1])
            task_specs = json.loads(cleaned)
            if not isinstance(task_specs, list):
                task_specs = []
        except json.JSONDecodeError as exc:
            logger.warning("AI task generation response was not valid JSON: %s", exc)

    # Fallback task specs when LLM is unavailable or JSON parse fails
    if not task_specs:
        task_specs = [
            {
                "title": "Review today's lead pipeline and follow up with uncontacted leads",
                "body_md": "Check GHL for all leads captured in the last 24 hours with no response. Contact within 5 minutes of capture is the target.",
                "assignRole": "SDR",
                "priority": "P0",
                "dueInHours": 2,
                "kind": "lead_no_response_5m",
            },
            {
                "title": "Audit ad creative performance and flag fatigued creatives",
                "body_md": "Pull Meta and Google Ads creative reports. Identify creatives with CTR < 1% or frequency > 4. Flag for replacement.",
                "assignRole": "Digital + Elevate",
                "priority": "P1",
                "dueInHours": 8,
                "kind": "ad_creative_fatigue",
            },
            {
                "title": "Confirm today's appointment schedule and call no-show risk patients",
                "body_md": "Cross-reference Dentally with today's confirmed appointments. Call any patient who has not confirmed by 10am.",
                "assignRole": "Practice Ops",
                "priority": "P1",
                "dueInHours": 4,
                "kind": "dentally_no_show",
            },
        ]

    created_count = 0
    created_titles: list[str] = []
    now_utc = datetime.now(timezone.utc)

    for spec in task_specs:
        try:
            title = spec.get("title", "").strip()
            if not title:
                continue
            body_md = spec.get("body_md", "")
            assign_role = spec.get("assignRole", "COO")
            priority = spec.get("priority", "P2")
            due_in_hours = int(spec.get("dueInHours", 24))
            kind = spec.get("kind", "voice_capture")
            due_at = now_utc + timedelta(hours=due_in_hours)

            await emit_task(
                db,
                kind=kind,
                title=title,
                body_md=body_md,
                source="ai_ceo",
                source_ref=f"ai_ceo_generate:{target_day}",
                priority_override=priority,
                due_at_override=due_at,
            )
            created_count += 1
            created_titles.append(title)
        except Exception as exc:
            # ExecutionGuardError or owner not found — log and skip, do not abort the batch
            logger.warning("Failed to create AI-generated task '%s': %s", spec.get("title"), exc)
            continue

    return GenerateTeamTasksResponse(
        success=True,
        tasksGenerated=created_count,
        taskTitles=created_titles,
    )


# ---------------------------------------------------------------------------
# Sidebar data — recent activity, automations, team
# ---------------------------------------------------------------------------

@router.get("/sidebar")
async def sidebar_data(
    db: AsyncSession = Depends(get_db),
    person: Person = Depends(current_user),
):
    """Single endpoint for right-sidebar: recent activity, automations, team."""
    from sqlalchemy import text

    # Recent activity — last 10 task events with actor + task names
    activity_sql = text("""
        SELECT te.kind, te.payload, te.at,
               t.title AS task_title,
               p.name  AS actor_name
        FROM   task_event te
        JOIN   task t ON t.id = te.task_id
        LEFT JOIN person p ON p.id = te.actor_id
        ORDER BY te.at DESC
        LIMIT 10
    """)
    activity_rows = (await db.execute(activity_sql)).mappings().all()
    recent_activity = []
    for row in activity_rows:
        recent_activity.append({
            "kind": row["kind"],
            "task_title": row["task_title"],
            "actor_name": row["actor_name"] or "System",
            "payload": row["payload"] or {},
            "at": row["at"].isoformat() if row["at"] else None,
        })

    # Automations — all rules
    auto_rows = (await db.execute(
        select(AutomationRule).order_by(AutomationRule.created_at.desc())
    )).scalars().all()
    automations = []
    for r in auto_rows:
        automations.append({
            "id": str(r.id),
            "name": r.name,
            "trigger_kind": r.trigger_kind,
            "action_kind": r.action_kind,
            "enabled": r.enabled,
            "last_fired_at": r.last_fired_at.isoformat() if r.last_fired_at else None,
        })

    # Team — all people
    people_rows = (await db.execute(
        select(Person).order_by(Person.name)
    )).scalars().all()
    team = []
    for p in people_rows:
        team.append({
            "id": str(p.id),
            "name": p.name,
            "role": p.role,
        })

    return {
        "recentActivity": recent_activity,
        "automations": automations,
        "team": team,
    }
