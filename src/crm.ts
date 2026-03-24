export type ViewerProfile = {
  username: string;
  points: number;
  messages: number;
  lastSeenAt: number;
  streakDays: number;
  tags: string[];
};

export type Campaign = {
  id: string;
  channel: string;
  name: string;
  segment: "new" | "casual" | "core" | "vip";
  rewardPoints: number;
  message: string;
  active: boolean;
};

const viewersByChannel = new Map<string, Map<string, ViewerProfile>>();
const campaignsByChannel = new Map<string, Campaign[]>();

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function computeSegment(profile: ViewerProfile): "new" | "casual" | "core" | "vip" {
  if (profile.points >= 1000 || profile.messages >= 450) return "vip";
  if (profile.points >= 400 || profile.messages >= 150) return "core";
  if (profile.points >= 80 || profile.messages >= 25) return "casual";
  return "new";
}

export const crm = {
  registerMessage(channel: string, username: string, timestamp = Date.now()): ViewerProfile {
    const normalizedChannel = channel.toLowerCase();
    const normalizedUser = username.toLowerCase();

    const channelMap = viewersByChannel.get(normalizedChannel) ?? new Map<string, ViewerProfile>();
    const current = channelMap.get(normalizedUser);

    if (!current) {
      const profile: ViewerProfile = {
        username: normalizedUser,
        points: 5,
        messages: 1,
        lastSeenAt: timestamp,
        streakDays: 1,
        tags: ["new"]
      };
      channelMap.set(normalizedUser, profile);
      viewersByChannel.set(normalizedChannel, channelMap);
      return profile;
    }

    const lastDay = startOfDay(current.lastSeenAt);
    const today = startOfDay(timestamp);

    if (today > lastDay) {
      const dayDiff = (today - lastDay) / (24 * 60 * 60 * 1000);
      current.streakDays = dayDiff === 1 ? current.streakDays + 1 : 1;
      current.points += 10;
    }

    current.messages += 1;
    current.points += 2;
    current.lastSeenAt = timestamp;

    const segment = computeSegment(current);
    current.tags = [...new Set([segment, ...(current.streakDays >= 7 ? ["consistente"] : [])])];

    channelMap.set(normalizedUser, current);
    viewersByChannel.set(normalizedChannel, channelMap);

    return current;
  },

  getViewer(channel: string, username: string): ViewerProfile | undefined {
    return viewersByChannel.get(channel.toLowerCase())?.get(username.toLowerCase());
  },

  listViewers(channel: string): ViewerProfile[] {
    return [...(viewersByChannel.get(channel.toLowerCase())?.values() ?? [])]
      .sort((a, b) => b.points - a.points);
  },

  createCampaign(input: Omit<Campaign, "id" | "active">): Campaign {
    const campaign: Campaign = {
      ...input,
      id: `${input.channel}-${Date.now()}`,
      active: true
    };

    const normalized = input.channel.toLowerCase();
    const existing = campaignsByChannel.get(normalized) ?? [];
    existing.push(campaign);
    campaignsByChannel.set(normalized, existing);

    return campaign;
  },

  listCampaigns(channel: string): Campaign[] {
    return campaignsByChannel.get(channel.toLowerCase()) ?? [];
  },

  applyCampaign(channel: string, campaignId: string): { awarded: number; viewers: number } {
    const normalized = channel.toLowerCase();
    const campaign = (campaignsByChannel.get(normalized) ?? []).find((item) => item.id === campaignId && item.active);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const viewers = this.listViewers(normalized);
    const target = viewers.filter((profile) => profile.tags.includes(campaign.segment));

    for (const viewer of target) {
      viewer.points += campaign.rewardPoints;
      if (!viewer.tags.includes("campanha_ativa")) {
        viewer.tags.push("campanha_ativa");
      }
    }

    return {
      awarded: target.length * campaign.rewardPoints,
      viewers: target.length
    };
  }
};
