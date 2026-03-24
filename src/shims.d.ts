declare module "jsonwebtoken" {
  const jwt: {
    sign(payload: object, secret: string, options?: object): string;
    verify(token: string, secret: string): unknown;
  };
  export default jwt;
}

declare module "stripe" {
  export default class Stripe {
    constructor(apiKey: string);
    checkout: {
      sessions: {
        create(input: object): Promise<{ url?: string }>;
      };
    };
    webhooks: {
      constructEvent(payload: Buffer, signature: string, secret: string): Stripe.Event;
    };
  }

  namespace Stripe {
    type Event = { type: string };
  }
}

declare module "pg" {
  export class Pool {
    constructor(config: object);
    query(queryText: string, values?: unknown[]): Promise<unknown>;
  }
}

declare module "cookie-parser" {
  import type { RequestHandler } from "express";
  export default function cookieParser(secret?: string): RequestHandler;
}

declare module "bullmq" {
  export class Queue<T> {
    constructor(name: string, options: object);
    add(name: string, data: T, options?: object): Promise<void>;
  }

  export class Worker<T> {
    constructor(name: string, processor: (job: { data: T }) => Promise<void>, options: object);
  }
}

declare module "ioredis" {
  export default class IORedis {
    constructor(url: string, options?: object);
  }
}
