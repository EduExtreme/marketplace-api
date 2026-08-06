import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { CREDIT_PRICE_CENTS } from "@/lib/leads/constants";
import { stripe } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  quantity: z.number().int().min(1).max(100),
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

  const { quantity } = parsed.data;

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    stripeCustomerId = customer.id;
    await db.update(users).set({ stripeCustomerId, updatedAt: new Date() }).where(eq(users.id, user.id));
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: `${quantity} crédito(s) de busca de leads` },
          unit_amount: CREDIT_PRICE_CENTS,
        },
        quantity,
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    metadata: { userId: user.id, leadsCreditsQuantity: String(quantity) },
  });

  if (!session.url) {
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
