from fastapi import Depends, Header, HTTPException, status

from app.core.security import decode_access_token


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    return decode_access_token(token)


def require_channel_owner(channel_login: str, user: dict = Depends(current_user)) -> dict:
    if user.get("sub") != channel_login.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden for this channel")
    return user
