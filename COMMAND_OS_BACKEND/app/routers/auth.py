"""Auth — login, /me, logout."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import current_user
from ..models import Person
from ..schemas import LoginIn, TokenOut, PersonOut
from ..security import verify_password, create_token, ROLE_SCOPES

router = APIRouter()


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Person).where(Person.username == body.username.lower().strip()))
    p = res.scalar_one_or_none()
    if not p or not verify_password(body.password, p.password_hash):
        raise HTTPException(401, "invalid username or password")
    if p.status != "active":
        raise HTTPException(403, "account not active")
    token = create_token(str(p.id), p.role, p.scope_layers or [])
    return TokenOut(
        access_token=token,
        person_id=p.id,
        name=p.name,
        role=p.role,
        scopes=ROLE_SCOPES.get(p.role, {}),
    )


@router.get("/me", response_model=PersonOut)
async def me(p: Person = Depends(current_user)):
    return p


@router.post("/logout")
async def logout(p: Person = Depends(current_user)):
    # Stateless JWT — client just discards the token. Could blacklist via Redis if needed.
    return {"ok": True}
