export type ChannelEventType = "message" | "follow" | "sub" | "raid";

export type ChannelEvent = {
  at: number;
  type: ChannelEventType;
  username?: string;
};

export type ClipSuggestion = {
  id: string;
  channel: string;
  startedAt: number;
  endedAt: number;
  score: number;
  reason: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedPlatforms: Array<"tiktok" | "youtube_shorts">;
};

const WINDOW_MS = 60_000;
const MAX_EVENT_AGE_MS = 20 * 60_000;

const eventsByChannel = new Map<string, ChannelEvent[]>();
const clipsByChannel = new Map<string, ClipSuggestion[]>();

function cleanupOldEvents(channel: string, now: number): ChannelEvent[] {
  const events = eventsByChannel.get(channel) ?? [];
  const filtered = events.filter((item) => now - item.at <= MAX_EVENT_AGE_MS);
  eventsByChannel.set(channel, filtered);
  return filtered;
}

function countInWindow(events: ChannelEvent[], now: number): number {
  return events.filter((item) => now - item.at <= WINDOW_MS).length;
}

function buildSuggestedTitle(channel: string, score: number): string {
  return `[${channel}] Momento explosivo (${score} pts)`;
}

export const clipEngine = {
  recordEvent(channel: string, event: Omit<ChannelEvent, "at"> & { at?: number }): ClipSuggestion | undefined {
    const normalized = channel.toLowerCase();
    const at = event.at ?? Date.now();
    const events = cleanupOldEvents(normalized, at);

    events.push({ ...event, at });
    eventsByChannel.set(normalized, events);

    const recentEvents = countInWindow(events, at);
    const previousWindow = events.filter((item) => {
      const age = at - item.at;
      return age > WINDOW_MS && age <= WINDOW_MS * 2;
    }).length;

    const baseline = Math.max(3, previousWindow || 1);
    const multiplier = recentEvents / baseline;

    if (multiplier < 2.2 || recentEvents < 12) {
      return undefined;
    }

    const existing = clipsByChannel.get(normalized) ?? [];
    const last = existing[existing.length - 1];
    if (last && at - last.endedAt < 90_000) {
      return last;
    }

    const score = Math.round(multiplier * 10 + recentEvents / 2);
    const suggestion: ClipSuggestion = {
      id: `${normalized}-${at}`,
      channel: normalized,
      startedAt: at - WINDOW_MS,
      endedAt: at,
      score,
      reason: `Pico de chat detectado (${recentEvents} eventos no último minuto, ${multiplier.toFixed(1)}x acima da base).`,
      suggestedTitle: buildSuggestedTitle(normalized, score),
      suggestedDescription: "Recorte sugerido automaticamente para Shorts/TikTok por pico de engajamento.",
      suggestedPlatforms: ["tiktok", "youtube_shorts"]
    };

    existing.push(suggestion);
    clipsByChannel.set(normalized, existing);

    return suggestion;
  },

  listSuggestions(channel: string): ClipSuggestion[] {
    return clipsByChannel.get(channel.toLowerCase()) ?? [];
  }
};
