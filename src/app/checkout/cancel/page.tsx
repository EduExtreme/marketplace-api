import type { Metadata } from "next";
import { CheckoutCancelView } from "@/components/checkout-cancel-view";

export const metadata: Metadata = {
  title: "Pagamento cancelado — HUBApis",
};

export default function CheckoutCancelPage() {
  return <CheckoutCancelView />;
}
