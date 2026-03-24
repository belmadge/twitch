import tmi from "tmi.js";
import { config } from "./config.js";
import { store } from "./store.js";
import { clipEngine } from "./clipEngine.js";
import { crm } from "./crm.js";
import type { Database } from "./database.js";
import type { QueueManager } from "./queue.js";

type ManagedChannel = {
  channel: string;
  ownerLogin: string;
};

const managedChannels = new Map<string, ManagedChannel>();

let db: Database | undefined;
let queue: QueueManager | undefined;

export function configureBotRuntime(runtime: { db?: Database; queue?: QueueManager }): void {
  db = runtime.db;
  queue = runtime.queue;
}

export const botClient = new tmi.Client({
  options: { debug: false },
  identity: {
    username: config.twitch.botUsername,
    password: config.twitch.botOauthToken
  },
  channels: []
});

let connected = false;

export async function ensureBotConnected(): Promise<void> {
  if (connected) return;

  await botClient.connect();
  connected = true;

  botClient.on("message", async (channel, tags, message, self) => {
    if (self) return;

    const cleanChannel = channel.replace("#", "");
    const username = tags["display-name"] ?? tags.username ?? "viewer";

    const viewer = crm.registerMessage(cleanChannel, username);
    await db?.upsertViewer(cleanChannel, viewer);

    const clip = clipEngine.recordEvent(cleanChannel, { type: "message", username });

    if (clip) {
      await db?.saveClip(clip);
      await queue?.enqueueClipAnalysis({
        channel: cleanChannel,
        clipId: clip.id,
        score: clip.score
      });
    }

    if (clip && clip.score >= 35) {
      await botClient.say(
        channel,
        `🔥 Pico detectado! Sugestão de clip criada (${clip.score} pts). Veja no dashboard de clips.`
      );
    }

    const trigger = message.trim().split(" ")[0]?.toLowerCase();
    if (!trigger?.startsWith("!")) return;

    if (trigger === "!comandos") {
      const commands = store.listCommands(cleanChannel);
      const list = commands.map((item) => item.trigger).join(", ") || "nenhum comando configurado ainda";
      await botClient.say(channel, `Comandos ativos: ${list}`);
      return;
    }

    if (trigger === "!ranking") {
      const ranking = crm.listViewers(cleanChannel).slice(0, 3);
      if (!ranking.length) {
        await botClient.say(channel, "Ainda não há dados de ranking.");
        return;
      }
      const formatted = ranking
        .map((item, index) => `${index + 1}. ${item.username} (${item.points} pts)`)
        .join(" | ");
      await botClient.say(channel, `🏆 Top comunidade: ${formatted}`);
      return;
    }

    const saved = store.findCommand(cleanChannel, trigger);
    if (!saved) return;

    const parsed = saved.response.replaceAll("{user}", username);

    await botClient.say(channel, parsed);
  });
}

export async function joinChannel(ownerLogin: string): Promise<void> {
  await ensureBotConnected();

  const normalized = ownerLogin.toLowerCase();
  if (managedChannels.has(normalized)) return;

  await botClient.join(normalized);
  managedChannels.set(normalized, { channel: normalized, ownerLogin: normalized });
}
