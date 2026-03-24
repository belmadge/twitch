import Stripe from "stripe";
import { config } from "./config.js";

const stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : undefined;

export function billingEnabled(): boolean {
  return Boolean(stripe && config.stripe.proPriceId);
}

export async function createCheckoutSession(params: { channelLogin: string; successUrl: string; cancelUrl: string }): Promise<string> {
  if (!stripe || !config.stripe.proPriceId) {
    throw new Error("Stripe not configured");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: config.stripe.proPriceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      channelLogin: params.channelLogin
    }
  });

  if (!session.url) {
    throw new Error("Stripe session without URL");
  }

  return session.url;
}

export async function parseBillingWebhook(signature: string | undefined, payload: Buffer): Promise<{ type: string }> {
  if (!stripe || !config.stripe.webhookSecret) {
    throw new Error("Stripe webhook not configured");
  }

  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
}
