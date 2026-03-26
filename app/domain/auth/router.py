import secrets

from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token, create_oauth_state_token, validate_oauth_state_token
from app.domain.auth.schemas import TokenOut
from app.domain.auth.service import build_twitch_authorize_url, exchange_code, fetch_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/twitch-url")
def twitch_url():
    state = create_oauth_state_token() + "." + secrets.token_urlsafe(12)
    return {"authorize_url": build_twitch_authorize_url(state), "state": state}


@router.get("/callback", response_model=TokenOut)
async def oauth_callback(code: str, state: str):
    state_token = state.split(".", maxsplit=1)[0]
    validate_oauth_state_token(state_token)
    try:
        token_data = await exchange_code(code)
        user = await fetch_user(token_data["access_token"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"OAuth failure: {exc}") from exc

    token = create_access_token(subject=user["login"].lower(), extra={"twitch_user_id": user["id"]})
    return TokenOut(access_token=token)
