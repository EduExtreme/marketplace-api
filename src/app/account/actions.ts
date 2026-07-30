"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { stripe } from "@/lib/stripe/client";
import { getCurrentPeriodEnd } from "@/lib/stripe/fulfill";
import { SUBSCRIPTION_ERROR_CODES, type SubscriptionActionState } from "@/lib/subscriptions/errors";

const cancelSchema = z.object({
  apiProviderId: z.string().trim().min(1),
});

export async function cancelSubscription(
  _prevState: SubscriptionActionState | undefined,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { errorCode: SUBSCRIPTION_ERROR_CODES.notFound };
  }

  const parsed = cancelSchema.safeParse({ apiProviderId: formData.get("apiProviderId") });
  if (!parsed.success) {
    return { errorCode: SUBSCRIPTION_ERROR_CODES.notFound };
  }

  const { apiProviderId } = parsed.data;

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(
      and(eq(purchases.userId, user.id), eq(purchases.apiProviderId, apiProviderId), eq(purchases.status, "paid")),
    )
    .limit(1);

  if (!purchase || !purchase.stripeSubscriptionId) {
    return { errorCode: SUBSCRIPTION_ERROR_CODES.notFound };
  }

  if (purchase.cancelAtPeriodEnd) {
    return { errorCode: null, canceledApiProviderId: apiProviderId };
  }

  let currentPeriodEnd = purchase.currentPeriodEnd;
  try {
    const subscription = await stripe.subscriptions.update(purchase.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    currentPeriodEnd = getCurrentPeriodEnd(subscription) ?? currentPeriodEnd;
  } catch {
    return { errorCode: SUBSCRIPTION_ERROR_CODES.stripeError };
  }

  await db
    .update(purchases)
    .set({ cancelAtPeriodEnd: true, currentPeriodEnd, updatedAt: new Date() })
    .where(eq(purchases.id, purchase.id));

  revalidatePath("/account");

  return { errorCode: null, canceledApiProviderId: apiProviderId };
}
