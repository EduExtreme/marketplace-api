import "server-only";

import Stripe from "stripe";

const stripeAdminSecretKey = process.env.STRIPE_ADMIN_SECRET_KEY;

if (!stripeAdminSecretKey) {
  throw new Error("STRIPE_ADMIN_SECRET_KEY is not set");
}

export const stripeAdmin = new Stripe(stripeAdminSecretKey, {
  apiVersion: "2026-06-24.dahlia",
});
