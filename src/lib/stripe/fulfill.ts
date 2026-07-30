import "server-only";

import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { purchases, unlockedApiKeys } from "@/lib/db/schema";
import { generateApiKey } from "@/lib/api-keys";
import { stripe } from "@/lib/stripe/client";

const REVOKED_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = ["canceled", "unpaid", "incomplete_expired"];

export function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

export async function fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeCheckoutSessionId, session.id))
    .limit(1);

  if (!purchase) {
    console.error(`No purchase record found for checkout session ${session.id}`);
    return;
  }

  if (purchase.status === "paid") {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

  const currentPeriodEnd = subscriptionId
    ? getCurrentPeriodEnd(await stripe.subscriptions.retrieve(subscriptionId))
    : null;

  await db
    .update(purchases)
    .set({
      status: "paid",
      stripePaymentIntentId: paymentIntentId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchase.id));

  const [existingKey] = await db
    .select({ id: unlockedApiKeys.id })
    .from(unlockedApiKeys)
    .where(and(eq(unlockedApiKeys.userId, purchase.userId), eq(unlockedApiKeys.apiProviderId, purchase.apiProviderId)))
    .limit(1);

  if (existingKey) {
    return;
  }

  await db.insert(unlockedApiKeys).values({
    userId: purchase.userId,
    apiProviderId: purchase.apiProviderId,
    apiKey: generateApiKey(),
    purchaseId: purchase.id,
  });
}

export async function markOrderFailed(session: Stripe.Checkout.Session): Promise<void> {
  await db
    .update(purchases)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(purchases.stripeCheckoutSessionId, session.id));
}

export async function revokeSubscriptionAccess(subscriptionId: string): Promise<void> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!purchase || purchase.status === "canceled") {
    return;
  }

  await db.update(purchases).set({ status: "canceled", updatedAt: new Date() }).where(eq(purchases.id, purchase.id));

  await db
    .delete(unlockedApiKeys)
    .where(and(eq(unlockedApiKeys.userId, purchase.userId), eq(unlockedApiKeys.apiProviderId, purchase.apiProviderId)));
}

export async function syncSubscriptionState(subscription: Stripe.Subscription): Promise<void> {
  if (REVOKED_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    await revokeSubscriptionAccess(subscription.id);
    return;
  }

  await db
    .update(purchases)
    .set({
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: getCurrentPeriodEnd(subscription),
      updatedAt: new Date(),
    })
    .where(eq(purchases.stripeSubscriptionId, subscription.id));
}
