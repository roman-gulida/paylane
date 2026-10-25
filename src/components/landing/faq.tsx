import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { FEE_LABEL } from "./fee-label";

export const FAQS = [
  {
    q: "Is Paylane a real payment service?",
    a: "No. Paylane is a demo product built as a portfolio project. No real payments are processed, no money moves, and no card data is stored. The checkout runs on test cards only.",
  },
  {
    q: "How much does it cost?",
    a: `In this demo the fee is ${FEE_LABEL} per successful payment. Failed and pending payments are not charged. The calculator above shows the exact amount for any payment size.`,
  },
  {
    q: "What is USDC?",
    a: "USDC is a stablecoin designed to track the US dollar one-to-one. In the demo, the net amount of every payment is shown in USDC so you can see how settlement would look.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Visa and Mastercard cards, Apple Pay and Google Pay. The wallet buttons in the demo checkout are visual only.",
  },
  {
    q: "How do I try the checkout?",
    a: "Open the demo checkout and use the test card 4242 4242 4242 4242 with any future expiry date and any CVC. The card 4000 0000 0000 0002 simulates a declined payment.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto w-full max-w-3xl scroll-mt-16 px-4 py-20 sm:px-6 lg:py-28"
    >
      <Reveal>
        <p className="text-sm font-medium text-accent">FAQ</p>
        <h2
          id="faq-title"
          className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          Questions, answered
        </h2>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl bg-surface ring-1 ring-line transition-colors open:bg-raised hover:bg-raised"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown
                aria-hidden
                className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="px-5 pb-5 text-muted">{f.a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
