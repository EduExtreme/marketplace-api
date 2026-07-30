import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { purchases, unlockedApiKeys, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { getApiProviderById } from "@/lib/data";
import { stripe } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  apiProviderId: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { apiProviderId } = parsed.data;
  const provider = await getApiProviderById(apiProviderId);
  if (!provider) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [existingKey] = await db
    .select({ id: unlockedApiKeys.id })
    .from(unlockedApiKeys)
    .where(and(eq(unlockedApiKeys.userId, user.id), eq(unlockedApiKeys.apiProviderId, apiProviderId)))
    .limit(1);

  if (existingKey) {
    return NextResponse.json({ error: "already_owned" }, { status: 409 });
  }

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    stripeCustomerId = customer.id;
    await db.update(users).set({ stripeCustomerId, updatedAt: new Date() }).where(eq(users.id, user.id));
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: provider.stripePriceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?apiProviderId=${apiProviderId}`,
    metadata: { userId: user.id, apiProviderId },
    subscription_data: { metadata: { userId: user.id, apiProviderId } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }

  await db.insert(purchases).values({
    userId: user.id,
    apiProviderId,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId,
    amountTotal: Math.round(provider.unlockPriceBRL * 100),
    currency: "brl",
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
