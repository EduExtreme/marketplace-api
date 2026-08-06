import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { grantLeadsCreditsFromCheckout, grantMonthlyLeadsCredits } from "@/lib/leads/credits";
import { stripe } from "@/lib/stripe/client";
import { fulfillOrder, markOrderFailed, revokeSubscriptionAccess, syncSubscriptionState } from "@/lib/stripe/fulfill";

async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.metadata?.leadsCreditsQuantity) {
    await grantLeadsCreditsFromCheckout(session);
    return;
  }
  await fulfillOrder(session);
}

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        await fulfillCheckoutSession(session);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await fulfillCheckoutSession(event.data.object);
      break;
    }
    case "checkout.session.async_payment_failed": {
      await markOrderFailed(event.data.object);
      break;
    }
    case "customer.subscription.deleted": {
      await revokeSubscriptionAccess(event.data.object.id);
      break;
    }
    case "customer.subscription.updated": {
      await syncSubscriptionState(event.data.object);
      break;
    }
    case "invoice.paid": {
      await grantMonthlyLeadsCredits(event.data.object);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
