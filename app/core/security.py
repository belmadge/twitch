from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = "HS256"


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": _utc_now() + timedelta(minutes=settings.jwt_exp_minutes),
    }
    if extra:
        payload.update(extra)

    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def create_oauth_state_token() -> str:
    payload = {
        "purpose": "oauth_state",
        "exp": _utc_now() + timedelta(minutes=10),
        "iat": _utc_now(),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def validate_oauth_state_token(state_token: str) -> None:
    try:
        payload = jwt.decode(state_token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state") from exc

    if payload.get("purpose") != "oauth_state":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
