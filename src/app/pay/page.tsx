import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/checkout";

export const metadata: Metadata = {
  title: "Demo checkout",
  alternates: { canonical: "/pay" },
  description:
    "Try the Paylane checkout: pay with a test card and watch the payment settle in USDC. No real money moves.",
};

export default function PayPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Checkout />
    </main>
  );
}
