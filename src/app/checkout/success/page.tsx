import type { Metadata } from "next";
import { stripe } from "@/lib/stripe/client";
import { CheckoutSuccessView } from "@/components/checkout-success-view";

export const metadata: Metadata = {
  title: "Pagamento confirmado — HUBApis",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  let isPaid = true;
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      isPaid = session.payment_status === "paid";
    } catch {
      isPaid = true;
    }
  }

  return <CheckoutSuccessView isPaid={isPaid} />;
}
