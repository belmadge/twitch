import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export type SessionPayload = {
  twitchLogin: string;
  twitchUserId: string;
};

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function parseSessionToken(token?: string): SessionPayload | undefined {
  if (!token) return undefined;

  try {
    return jwt.verify(token, config.jwtSecret) as SessionPayload;
  } catch {
    return undefined;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.session ?? req.headers.authorization?.replace("Bearer ", "");
  const session = parseSessionToken(token);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as Request & { session?: SessionPayload }).session = session;
  next();
}

export function requireChannelOwnership(req: Request, res: Response, next: NextFunction): void {
  const session = (req as Request & { session?: SessionPayload }).session;
  const channel = String(req.params.login ?? "").toLowerCase();

  if (!session || session.twitchLogin.toLowerCase() !== channel) {
    res.status(403).json({ error: "Forbidden: channel ownership required" });
    return;
  }

  next();
}
