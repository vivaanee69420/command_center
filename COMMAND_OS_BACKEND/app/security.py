"""JWT + bcrypt + RBAC scopes."""
import base64, os
from datetime import datetime, timedelta, timezone
from typing import Optional

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

_pw = CryptContext(schemes=["bcrypt"], deprecated="auto")
_ALG = "HS256"


def hash_password(p: str) -> str: return _pw.hash(p)
def verify_password(p: str, h: str) -> bool: return _pw.verify(p, h)


def create_token(person_id: str, role: str, scopes: list[str]) -> str:
    payload = {
        "sub": person_id, "role": role, "scopes": scopes,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings().TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, settings().JWT_SECRET, algorithm=_ALG)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings().JWT_SECRET, algorithms=[_ALG])
    except JWTError:
        return None


# ---- token-at-rest encryption for stored OAuth credentials ----
def _fernet() -> Fernet:
    k = settings().TOKEN_ENC_KEY
    if not k:
        # ephemeral dev fallback — generate a new key per process
        k = base64.urlsafe_b64encode(os.urandom(32)).decode()
    if len(base64.urlsafe_b64decode(k.encode() + b"=" * (-len(k) % 4))) != 32:
        raise RuntimeError("TOKEN_ENC_KEY must be a 32-byte base64 string")
    # Fernet key needs urlsafe base64
    return Fernet(k.encode() if isinstance(k, str) else k)


def encrypt(s: str) -> str:
    if not s: return ""
    return _fernet().encrypt(s.encode()).decode()


def decrypt(c: str) -> str:
    if not c: return ""
    return _fernet().decrypt(c.encode()).decode()


# ---- RBAC scopes (mirrors the frontend ROLE_SCOPES) ----
ROLE_SCOPES = {
    "CEO":                {"layers": ["*"], "modules": ["*"]},
    "COO":                {"layers": ["*"], "modules": ["*"]},
    "Marketing Lead":     {"layers": ["control","execution","brain","growth"], "modules": ["*"]},
    "Digital + Elevate":  {"layers": ["control","execution","brain","growth"],
                           "modules": ["overview","ads","lead_engine","ghl_auto","ghl_dash","integration2","assets"]},
    "Practice Ops":       {"layers": ["control","execution","data"],
                           "modules": ["overview","sales","ghl_dash","setter","voice_tasks","business_pnl","team_hub","assets"]},
    "Lab BD":             {"layers": ["execution","growth"],
                           "modules": ["overview","lead_engine","offers","sales","assets"]},
    "SDR":                {"layers": ["execution"],
                           "modules": ["overview","lead_engine","setter","voice_tasks","sales","assets"]},
    "SEO Specialist":     {"layers": ["execution","growth"],
                           "modules": ["seo","content","content_cal","competitors","assets"]},
    "Social Specialist":  {"layers": ["execution","growth"],
                           "modules": ["content","content_cal","ads","assets"]},
    "General Outsourcer": {"layers": ["execution"], "modules": ["assets"]},
}


def can(role: str, layer: Optional[str] = None, module: Optional[str] = None) -> bool:
    sc = ROLE_SCOPES.get(role, ROLE_SCOPES["General Outsourcer"])
    if layer is not None:
        if "*" not in sc["layers"] and layer not in sc["layers"]:
            return False
    if module is not None:
        if "*" not in sc["modules"] and module not in sc["modules"]:
            return False
    return True
