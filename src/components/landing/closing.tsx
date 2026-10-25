import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28"
    >
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] bg-surface px-6 py-14 text-center ring-1 ring-line sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="glow-pulse absolute left-1/2 top-0 size-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[100px]"
          />
          <h2
            id="cta-title"
            className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl"
          >
            See a payment go from card to USDC
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-muted">
            Run a test payment, then find it in the dashboard
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/pay" size="lg">
              Try the demo
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
            <ButtonLink href="/dashboard" size="lg" variant="secondary">
              Open the dashboard
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted">
            A demo payment gateway built as a portfolio project. No real
            payments are processed. Not affiliated with any payment provider.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li>
              <Link href="/pay" className="transition-colors hover:text-fg">
                Demo checkout
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-fg"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <a href="#faq" className="transition-colors hover:text-fg">
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
