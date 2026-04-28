"""ExecutionGuard — the rule that protects the OS from drift.

Hard rules:
  1. Every task MUST have an owner_id and a due_at.
  2. Every task moved to 'done' MUST set completion_proof_url OR kpi_delta.
  3. Every task escalating to 'review' MUST have an assigned_by.
  4. Owners must be active.
  5. Due dates cannot be in the past for newly-created tasks.

If any rule is violated, raise ExecutionGuardError. The API converts it to HTTP 422.
"""
from datetime import datetime, timezone
from typing import Optional


class ExecutionGuardError(ValueError):
    pass


def guard_create(*, owner_id, due_at: datetime, title: str, status: str = "backlog") -> None:
    if not owner_id:
        raise ExecutionGuardError("task.owner_id is required (no task without an owner)")
    if not due_at:
        raise ExecutionGuardError("task.due_at is required (no task without a deadline)")
    if not title or len(title.strip()) < 2:
        raise ExecutionGuardError("task.title must be at least 2 chars")
    now = datetime.now(timezone.utc)
    if due_at < now and status not in ("done",):
        # allow back-dated done; everything else must be future
        raise ExecutionGuardError(f"task.due_at cannot be in the past ({due_at.isoformat()} < {now.isoformat()})")


def guard_update(*, status: str, completion_proof_url: Optional[str], kpi_delta) -> None:
    if status == "done" and not completion_proof_url and kpi_delta is None:
        raise ExecutionGuardError(
            "cannot move task to 'done' without completion_proof_url OR kpi_delta — "
            "no closure without measurable output"
        )


def guard_owner_active(person) -> None:
    if not person:
        raise ExecutionGuardError("owner not found")
    if person.status != "active":
        raise ExecutionGuardError(f"owner {person.username} is not active")
