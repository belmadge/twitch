import dotenv from "dotenv";

dotenv.config();

const requiredKeys = [
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_SECRET",
  "TWITCH_REDIRECT_URI",
  "TWITCH_BOT_USERNAME",
  "TWITCH_BOT_OAUTH_TOKEN",
  "PORT",
  "JWT_SECRET"
] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT),
  appBaseUrl: process.env.APP_BASE_URL ?? `http://localhost:${process.env.PORT}`,
  jwtSecret: process.env.JWT_SECRET!,
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    redirectUri: process.env.TWITCH_REDIRECT_URI!,
    botUsername: process.env.TWITCH_BOT_USERNAME!,
    botOauthToken: process.env.TWITCH_BOT_OAUTH_TOKEN!
  },
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    proPriceId: process.env.STRIPE_PRICE_PRO
  }
};
