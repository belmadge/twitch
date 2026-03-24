import secrets

from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token
from app.domain.auth.schemas import TokenOut
from app.domain.auth.service import build_twitch_authorize_url, exchange_code, fetch_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/twitch-url")
def twitch_url():
    state = secrets.token_urlsafe(24)
    return {"authorize_url": build_twitch_authorize_url(state), "state": state}


@router.get("/callback", response_model=TokenOut)
async def oauth_callback(code: str):
    try:
        token_data = await exchange_code(code)
        user = await fetch_user(token_data["access_token"])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"OAuth failure: {exc}") from exc

    token = create_access_token(subject=user["login"].lower(), extra={"twitch_user_id": user["id"]})
    return TokenOut(access_token=token)
