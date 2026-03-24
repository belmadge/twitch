import { Pool } from "pg";
import type { Campaign, ViewerProfile } from "./crm.js";
import type { ClipSuggestion } from "./clipEngine.js";
import type { CommandDefinition, UserConnection } from "./types.js";

export class Database {
  private pool?: Pool;

  constructor(databaseUrl?: string) {
    if (databaseUrl) {
      this.pool = new Pool({ connectionString: databaseUrl });
    }
  }

  get enabled(): boolean {
    return Boolean(this.pool);
  }

  async init(): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        login TEXT PRIMARY KEY,
        id TEXT NOT NULL,
        display_name TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        joined_channels JSONB NOT NULL DEFAULT '[]'::jsonb
      );

      CREATE TABLE IF NOT EXISTS commands (
        channel TEXT NOT NULL,
        trigger TEXT NOT NULL,
        response TEXT NOT NULL,
        PRIMARY KEY (channel, trigger)
      );

      CREATE TABLE IF NOT EXISTS clips (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        started_at BIGINT NOT NULL,
        ended_at BIGINT NOT NULL,
        score INT NOT NULL,
        reason TEXT NOT NULL,
        suggested_title TEXT NOT NULL,
        suggested_description TEXT NOT NULL,
        suggested_platforms JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS viewers (
        channel TEXT NOT NULL,
        username TEXT NOT NULL,
        points INT NOT NULL,
        messages INT NOT NULL,
        last_seen_at BIGINT NOT NULL,
        streak_days INT NOT NULL,
        tags JSONB NOT NULL,
        PRIMARY KEY (channel, username)
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        name TEXT NOT NULL,
        segment TEXT NOT NULL,
        reward_points INT NOT NULL,
        message TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);
  }

  async upsertUser(user: UserConnection): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO users (login, id, display_name, access_token, refresh_token, joined_channels)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (login) DO UPDATE
       SET id = EXCLUDED.id,
           display_name = EXCLUDED.display_name,
           access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           joined_channels = EXCLUDED.joined_channels`,
      [user.login.toLowerCase(), user.id, user.displayName, user.accessToken, user.refreshToken ?? null, JSON.stringify(user.joinedChannels)]
    );
  }

  async upsertCommand(channel: string, command: CommandDefinition): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO commands (channel, trigger, response) VALUES ($1,$2,$3)
       ON CONFLICT (channel, trigger) DO UPDATE SET response = EXCLUDED.response`,
      [channel.toLowerCase(), command.trigger.toLowerCase(), command.response]
    );
  }

  async saveClip(clip: ClipSuggestion): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO clips (id, channel, started_at, ended_at, score, reason, suggested_title, suggested_description, suggested_platforms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [
        clip.id,
        clip.channel,
        clip.startedAt,
        clip.endedAt,
        clip.score,
        clip.reason,
        clip.suggestedTitle,
        clip.suggestedDescription,
        JSON.stringify(clip.suggestedPlatforms)
      ]
    );
  }

  async upsertViewer(channel: string, viewer: ViewerProfile): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO viewers (channel, username, points, messages, last_seen_at, streak_days, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (channel, username) DO UPDATE
       SET points=EXCLUDED.points,
           messages=EXCLUDED.messages,
           last_seen_at=EXCLUDED.last_seen_at,
           streak_days=EXCLUDED.streak_days,
           tags=EXCLUDED.tags`,
      [channel.toLowerCase(), viewer.username.toLowerCase(), viewer.points, viewer.messages, viewer.lastSeenAt, viewer.streakDays, JSON.stringify(viewer.tags)]
    );
  }

  async saveCampaign(campaign: Campaign): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO campaigns (id, channel, name, segment, reward_points, message, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           segment = EXCLUDED.segment,
           reward_points = EXCLUDED.reward_points,
           message = EXCLUDED.message,
           active = EXCLUDED.active`,
      [campaign.id, campaign.channel.toLowerCase(), campaign.name, campaign.segment, campaign.rewardPoints, campaign.message, campaign.active]
    );
  }
}
