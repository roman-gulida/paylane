import {
  Coins,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Smartphone,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { FEE_LABEL } from "./fee-label";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CreditCard,
    title: "Cards and wallets",
    body: "Visa, Mastercard, Apple Pay and Google Pay, from one checkout.",
  },
  {
    icon: Coins,
    title: "USDC settlement",
    body: "Net payments settle in USDC, a dollar-pegged token, instead of waiting on bank rails.",
  },
  {
    icon: Receipt,
    title: "One visible fee",
    body: `${FEE_LABEL} per successful payment, shown before and after every transaction.`,
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard that reads clearly",
    body: "Filter payments by status, open any transaction, and see exactly what settled.",
  },
  {
    icon: Smartphone,
    title: "Built for every screen",
    body: "Checkout and dashboard are designed phone-first and scale up cleanly.",
  },
  {
    icon: Zap,
    title: "Simple to try",
    body: "Use the demo checkout with a test card and watch the payment appear in the dashboard.",
  },
];

export function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28"
    >
      <Reveal>
        <p className="text-sm font-medium text-accent">Why Paylane</p>
        <h2
          id="features-title"
          className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          Payments without the fog
        </h2>
      </Reveal>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <li key={f.title}>
            <Reveal delay={(i % 3) * 0.08} className="h-full">
              <TiltCard className="group rounded-(--radius-card) bg-surface p-6 ring-1 ring-line hover:bg-raised">
                <span className="flex size-11 items-center justify-center rounded-full bg-raised text-accent transition-colors group-hover:bg-accent/15">
                  <f.icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-muted">{f.body}</p>
              </TiltCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
