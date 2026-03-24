import crypto from "node:crypto";
import express from "express";
import { config } from "./config.js";
import { joinChannel } from "./bot.js";
import { store } from "./store.js";
import { buildAuthorizeUrl, exchangeCodeForToken, fetchCurrentUser } from "./twitchAuth.js";
import { clipEngine } from "./clipEngine.js";
import { crm } from "./crm.js";

const app = express();
app.use(express.json());

const loginStates = new Set<string>();

app.get("/", (_req, res) => {
  res.type("html").send(`
    <h1>Twitch Chat Premium SaaS (starter)</h1>
    <p>Conecte seu canal e use automação + clipagem inteligente + CRM de comunidade.</p>
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

    store.upsertUser({
      ...profile,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      joinedChannels: [profile.login]
    });

    await joinChannel(profile.login);

    res.redirect(`${config.appBaseUrl}/dashboard/${profile.login}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not authenticate with Twitch" });
  }
});

app.get("/dashboard/:login", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).send("Canal não conectado");
    return;
  }

  const commands = store.listCommands(login)
    .map((item) => `<li><code>${item.trigger}</code> → ${item.response}</li>`)
    .join("");

  const clipCount = clipEngine.listSuggestions(login).length;
  const viewersCount = crm.listViewers(login).length;

  res.type("html").send(`
    <h2>Dashboard: ${user.displayName}</h2>
    <p>Use o endpoint abaixo para criar comandos premium:</p>
    <pre>POST /api/channels/${login}/commands</pre>
    <pre>{ "trigger": "!discord", "response": "Entre no Discord: discord.gg/seulink" }</pre>
    <h3>Comandos atuais</h3>
    <ul>${commands || "<li>Nenhum comando configurado.</li>"}</ul>

    <h3>Clipagem automática</h3>
    <p>Sugestões geradas: <strong>${clipCount}</strong></p>
    <pre>GET /api/channels/${login}/clips</pre>

    <h3>CRM de comunidade</h3>
    <p>Viewers mapeados: <strong>${viewersCount}</strong></p>
    <pre>GET /api/channels/${login}/crm/viewers</pre>
    <pre>POST /api/channels/${login}/crm/campaigns</pre>
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

  store.addCommand(login, { trigger, response });

  res.status(201).json({ ok: true, trigger, response });
});

app.get("/api/channels/:login/clips", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Channel not connected" });
    return;
  }

  res.json({ clips: clipEngine.listSuggestions(login) });
});

app.get("/api/channels/:login/crm/viewers", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Channel not connected" });
    return;
  }

  res.json({ viewers: crm.listViewers(login) });
});

app.post("/api/channels/:login/crm/campaigns", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Channel not connected" });
    return;
  }

  const name = String(req.body.name ?? "").trim();
  const segment = String(req.body.segment ?? "").trim() as "new" | "casual" | "core" | "vip";
  const rewardPoints = Number(req.body.rewardPoints ?? 0);
  const message = String(req.body.message ?? "").trim();

  if (!name || !["new", "casual", "core", "vip"].includes(segment) || rewardPoints <= 0 || !message) {
    res.status(400).json({ error: "Invalid campaign payload" });
    return;
  }

  const campaign = crm.createCampaign({
    channel: login,
    name,
    segment,
    rewardPoints,
    message
  });

  res.status(201).json({ campaign });
});

app.post("/api/channels/:login/crm/campaigns/:campaignId/apply", (req, res) => {
  const login = req.params.login.toLowerCase();
  const user = store.getUser(login);

  if (!user) {
    res.status(404).json({ error: "Channel not connected" });
    return;
  }

  try {
    const result = crm.applyCampaign(login, req.params.campaignId);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
