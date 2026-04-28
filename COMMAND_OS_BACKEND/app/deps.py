"""FastAPI dependencies — auth, current user, role guard."""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .db import get_db
from .models import Person
from .security import decode_token, can


async def current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> Person:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "missing bearer token")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "invalid or expired token")
    res = await db.execute(select(Person).where(Person.id == payload["sub"]))
    person = res.scalar_one_or_none()
    if not person:
        raise HTTPException(401, "user not found")
    return person


def require_layer(layer: str):
    async def _guard(p: Person = Depends(current_user)) -> Person:
        if not can(p.role, layer=layer):
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"role {p.role} cannot access layer {layer}")
        return p
    return _guard


def require_role(*roles: str):
    async def _guard(p: Person = Depends(current_user)) -> Person:
        if p.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"need one of: {','.join(roles)}")
        return p
    return _guard
