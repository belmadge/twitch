import tmi from "tmi.js";
import { config } from "./config.js";
import { store } from "./store.js";

type ManagedChannel = {
  channel: string;
  ownerLogin: string;
};

const managedChannels = new Map<string, ManagedChannel>();

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

    const trigger = message.trim().split(" ")[0]?.toLowerCase();
    if (!trigger?.startsWith("!")) return;

    if (trigger === "!comandos") {
      const commands = store.listCommands(channel.replace("#", ""));
      const list = commands.map((item) => item.trigger).join(", ") || "nenhum comando configurado ainda";
      await botClient.say(channel, `Comandos ativos: ${list}`);
      return;
    }

    const saved = store.findCommand(channel.replace("#", ""), trigger);
    if (!saved) return;

    const username = tags["display-name"] ?? tags.username ?? "viewer";
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
