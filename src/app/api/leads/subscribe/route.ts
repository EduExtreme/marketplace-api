import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { purchases, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { LEADS_PRODUCT_ID } from "@/lib/leads/constants";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_LEADS_SUBSCRIPTION_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const [existingSubscription] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.userId, user.id), eq(purchases.apiProviderId, LEADS_PRODUCT_ID), eq(purchases.status, "paid")))
    .limit(1);

  if (existingSubscription) {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
  }

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    stripeCustomerId = customer.id;
    await db.update(users).set({ stripeCustomerId, updatedAt: new Date() }).where(eq(users.id, user.id));
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const price = await stripe.prices.retrieve(priceId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    metadata: { userId: user.id, apiProviderId: LEADS_PRODUCT_ID },
    subscription_data: { metadata: { userId: user.id, apiProviderId: LEADS_PRODUCT_ID } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }

  await db.insert(purchases).values({
    userId: user.id,
    apiProviderId: LEADS_PRODUCT_ID,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId,
    amountTotal: price.unit_amount ?? 0,
    currency: price.currency,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
