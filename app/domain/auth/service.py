import urllib.parse

import httpx

from app.core.config import settings


def build_twitch_authorize_url(state: str) -> str:
    params = {
        "client_id": settings.twitch_client_id,
        "redirect_uri": settings.twitch_redirect_uri,
        "response_type": "code",
        "scope": "chat:read chat:edit channel:read:redemptions",
        "state": state,
    }
    return f"https://id.twitch.tv/oauth2/authorize?{urllib.parse.urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://id.twitch.tv/oauth2/token",
            data={
                "client_id": settings.twitch_client_id,
                "client_secret": settings.twitch_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.twitch_redirect_uri,
            },
        )
        response.raise_for_status()
        return response.json()


async def fetch_user(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            "https://api.twitch.tv/helix/users",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Client-Id": settings.twitch_client_id,
            },
        )
        response.raise_for_status()
        data = response.json().get("data", [])
        if not data:
            raise ValueError("Twitch user not found")
        return data[0]
