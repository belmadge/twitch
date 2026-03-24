import axios from "axios";
import { config } from "./config.js";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const USER_URL = "https://api.twitch.tv/helix/users";

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: config.twitch.clientId,
    redirect_uri: config.twitch.redirectUri,
    response_type: "code",
    scope: "channel:read:redemptions chat:read chat:edit",
    state
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
  const payload = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.twitch.redirectUri
  });

  const response = await axios.post(TOKEN_URL, payload);

  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token
  };
}

export async function fetchCurrentUser(accessToken: string): Promise<{ id: string; login: string; displayName: string }> {
  const response = await axios.get(USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": config.twitch.clientId
    }
  });

  const user = response.data.data?.[0];

  if (!user) {
    throw new Error("Unable to fetch Twitch user profile");
  }

  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name
  };
}
