import "server-only";

import { and, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { creditTransactions, purchases } from "@/lib/db/schema";
import { LEADS_PRODUCT_ID, MONTHLY_SEARCH_QUOTA } from "@/lib/leads/constants";

export async function getCreditBalance(userId: string): Promise<number> {
  const [result] = await db
    .select({ balance: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)::int` })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  return result?.balance ?? 0;
}

export async function grantInitialLeadsCredits(userId: string): Promise<void> {
  await db.insert(creditTransactions).values({
    userId,
    amount: MONTHLY_SEARCH_QUOTA,
    type: "subscription_grant",
  });
}

// Renova a cota mensal a cada ciclo de cobrança da assinatura (não roda no primeiro
// invoice — esse já é coberto por grantInitialLeadsCredits via fulfillOrder).
export async function grantMonthlyLeadsCredits(invoice: Stripe.Invoice): Promise<void> {
  if (invoice.billing_reason !== "subscription_cycle" || !invoice.id) return;

  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
  if (!subscriptionId) return;

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.stripeSubscriptionId, subscriptionId), eq(purchases.apiProviderId, LEADS_PRODUCT_ID)))
    .limit(1);

  if (!purchase || purchase.status !== "paid") return;

  const [existing] = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(eq(creditTransactions.stripeInvoiceId, invoice.id))
    .limit(1);
  if (existing) return;

  await db.insert(creditTransactions).values({
    userId: purchase.userId,
    amount: MONTHLY_SEARCH_QUOTA,
    type: "subscription_grant",
    stripeInvoiceId: invoice.id,
  });
}

// Concede créditos avulsos comprados fora da cota (checkout mode: payment,
// sem linha em `purchases` — não é uma assinatura).
export async function grantLeadsCreditsFromCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const quantity = Number(session.metadata?.leadsCreditsQuantity ?? "0");
  if (!userId || quantity < 1) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  if (!paymentIntentId) return;

  const [existing] = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(eq(creditTransactions.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  if (existing) return;

  await db.insert(creditTransactions).values({
    userId,
    amount: quantity,
    type: "purchase",
    stripePaymentIntentId: paymentIntentId,
  });
}

export async function debitSearchCredit(userId: string, searchId: string): Promise<void> {
  await db.insert(creditTransactions).values({ userId, amount: -1, type: "search_debit", searchId });
}
