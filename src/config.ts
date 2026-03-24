import dotenv from "dotenv";

dotenv.config();

const requiredKeys = [
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_SECRET",
  "TWITCH_REDIRECT_URI",
  "TWITCH_BOT_USERNAME",
  "TWITCH_BOT_OAUTH_TOKEN",
  "PORT"
] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT),
  appBaseUrl: process.env.APP_BASE_URL ?? `http://localhost:${process.env.PORT}`,
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    redirectUri: process.env.TWITCH_REDIRECT_URI!,
    botUsername: process.env.TWITCH_BOT_USERNAME!,
    botOauthToken: process.env.TWITCH_BOT_OAUTH_TOKEN!
  }
};
