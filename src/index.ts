import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { configureBotRuntime, joinChannel } from "./bot.js";
import { store } from "./store.js";
import { buildAuthorizeUrl, exchangeCodeForToken, fetchCurrentUser } from "./twitchAuth.js";
import { clipEngine } from "./clipEngine.js";
import { crm } from "./crm.js";
import { createSessionToken, requireAuth, requireChannelOwnership } from "./auth.js";
import { billingEnabled, createCheckoutSession, parseBillingWebhook } from "./billing.js";
import { Database } from "./database.js";
import { QueueManager } from "./queue.js";

const app = express();
const rawBodySaver = express.raw({ type: "application/json" });
const db = new Database(config.databaseUrl);
const queue = new QueueManager(config.redisUrl);
configureBotRuntime({ db, queue });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.post("/webhooks/stripe", rawBodySaver, async (req, res) => {
  try {
    const event = await parseBillingWebhook(req.headers["stripe-signature"] as string | undefined, req.body as Buffer);
    console.log(`[stripe] event=${event.type}`);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
app.use(express.json());
app.use("/app", express.static(path.join(__dirname, "..", "public")));
import express from "express";
import { config } from "./config.js";
import { joinChannel } from "./bot.js";
import { store } from "./store.js";
import { buildAuthorizeUrl, exchangeCodeForToken, fetchCurrentUser } from "./twitchAuth.js";

const app = express();
app.use(express.json());

const loginStates = new Set<string>();

app.get("/", (_req, res) => {
  res.redirect("/app");
  res.type("html").send(`
    <h1>Twitch Chat Premium SaaS (starter)</h1>
    <p>Conecte seu canal e crie comandos personalizados para seu bot.</p>
    <a href="/auth/twitch">Conectar com Twitch</a>
  `);
});

app.get("/auth/twitch", (_req, res) => {
  const state = crypto.randomUUID();
  loginStates.add(state);
  res.redirect(buildAuthorizeUrl(state));
});

app.get("/auth/callback", async (req, res) => {
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");

  if (!code || !state || !loginStates.has(state)) {
    res.status(400).json({ error: "Invalid OAuth callback" });
    return;
  }

  loginStates.delete(state);

  try {
    const token = await exchangeCodeForToken(code);
    const profile = await fetchCurrentUser(token.accessToken);

    const user = {
    store.upsertUser({
      ...profile,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      joinedChannels: [profile.login]
    };

    store.upsertUser(user);
    await db.upsertUser(user);

    await joinChannel(profile.login);

    const session = createSessionToken({
      twitchLogin: profile.login.toLowerCase(),
      twitchUserId: profile.id
    });

    res.cookie("session", session, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`/app/dashboard.html?channel=${profile.login.toLowerCase()}`);
    });

    await joinChannel(profile.login);

    res.redirect(`${config.appBaseUrl}/dashboard/${profile.login}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not authenticate with Twitch" });
  }
});

app.get("/api/me", requireAuth, (req, res) => {
  const session = (req as express.Request & { session?: { twitchLogin: string } }).session;
  res.json({ user: session });
});

app.get("/api/channels/:login/dashboard", requireAuth, requireChannelOwnership, (req, res) => {
app.get("/dashboard/:login", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Canal não conectado" });
    return;
  }

  res.json({
    user: {
      id: user.id,
      login: user.login,
      displayName: user.displayName
    },
    commands: store.listCommands(login),
    clips: clipEngine.listSuggestions(login),
    viewers: crm.listViewers(login),
    billingEnabled: billingEnabled(),
    queueEnabled: queue.enabled,
    persistenceEnabled: db.enabled
  });
});

app.post("/api/channels/:login/commands", requireAuth, requireChannelOwnership, async (req, res) => {
  const login = req.params.login.toLowerCase();
    res.status(404).send("Canal não conectado");
    return;
  }

  const commands = store.listCommands(login)
    .map((item) => `<li><code>${item.trigger}</code> → ${item.response}</li>`)
    .join("");

  res.type("html").send(`
    <h2>Dashboard: ${user.displayName}</h2>
    <p>Use o endpoint abaixo para criar comandos premium:</p>
    <pre>POST /api/channels/${login}/commands</pre>
    <pre>{ "trigger": "!discord", "response": "Entre no Discord: discord.gg/seulink" }</pre>
    <h3>Comandos atuais</h3>
    <ul>${commands || "<li>Nenhum comando configurado.</li>"}</ul>
  `);
});

app.post("/api/channels/:login/commands", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Channel not connected" });
    return;
  }

  const trigger = String(req.body.trigger ?? "").trim().toLowerCase();
  const response = String(req.body.response ?? "").trim();

  if (!trigger.startsWith("!") || response.length < 2) {
    res.status(400).json({ error: "Invalid command format" });
    return;
  }

  const command = { trigger, response };
  store.addCommand(login, command);
  await db.upsertCommand(login, command);
  store.addCommand(login, { trigger, response });

  res.status(201).json({ ok: true, trigger, response });
});

app.get("/api/channels/:login/clips", requireAuth, requireChannelOwnership, (req, res) => {
  const login = req.params.login.toLowerCase();
  res.json({ clips: clipEngine.listSuggestions(login) });
});

app.get("/api/channels/:login/crm/viewers", requireAuth, requireChannelOwnership, (req, res) => {
  const login = req.params.login.toLowerCase();
  res.json({ viewers: crm.listViewers(login) });
});

app.post("/api/channels/:login/crm/campaigns", requireAuth, requireChannelOwnership, async (req, res) => {
  const login = req.params.login.toLowerCase();

  const name = String(req.body.name ?? "").trim();
  const segment = String(req.body.segment ?? "").trim() as "new" | "casual" | "core" | "vip";
  const rewardPoints = Number(req.body.rewardPoints ?? 0);
  const message = String(req.body.message ?? "").trim();

  if (!name || !["new", "casual", "core", "vip"].includes(segment) || rewardPoints <= 0 || !message) {
    res.status(400).json({ error: "Invalid campaign payload" });
    return;
  }

  const campaign = crm.createCampaign({ channel: login, name, segment, rewardPoints, message });
  await db.saveCampaign(campaign);

  res.status(201).json({ campaign });
});

app.post("/api/channels/:login/crm/campaigns/:campaignId/apply", requireAuth, requireChannelOwnership, async (req, res) => {
  const login = req.params.login.toLowerCase();

  try {
    const result = crm.applyCampaign(login, req.params.campaignId);

    for (const viewer of crm.listViewers(login)) {
      await db.upsertViewer(login, viewer);
    }

    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.post("/api/channels/:login/billing/checkout", requireAuth, requireChannelOwnership, async (req, res) => {
  const login = req.params.login.toLowerCase();

  if (!billingEnabled()) {
    res.status(400).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const checkoutUrl = await createCheckoutSession({
      channelLogin: login,
      successUrl: `${config.appBaseUrl}/app/dashboard.html?channel=${login}&billing=success`,
      cancelUrl: `${config.appBaseUrl}/app/dashboard.html?channel=${login}&billing=cancel`
    });

    res.json({ checkoutUrl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, db: db.enabled, queue: queue.enabled, billing: billingEnabled() });
});

async function bootstrap(): Promise<void> {
  await db.init();

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap app", error);
  process.exit(1);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
