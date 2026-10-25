"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { formatUSD, formatUSDC } from "@/lib/format";
import { DEMO_MERCHANT } from "@/lib/orders";
import { networkLabel, shortAddress } from "@/lib/wallet";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CheckoutSuccess } from "@/lib/types";

/** Shown in place of the form once the payment has succeeded */
export function Receipt({
  result,
  methodLabel,
  email,
  onNewPayment,
}: {
  result: CheckoutSuccess;
  methodLabel: string;
  email: string;
  onNewPayment: () => void;
}) {
  const reduce = usePrefersReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so keyboard and screen-reader users land on it
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="flex flex-col items-center text-center">
        <svg
          aria-hidden
          viewBox="0 0 64 64"
          className="size-16 text-success"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.path
            d="M20 33l8 8 16-17"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
          />
        </svg>

        <h2
          ref={heading}
          tabIndex={-1}
          role="status"
          className="mt-5 text-2xl font-semibold tracking-[-0.02em] outline-none"
        >
          Payment successful
        </h2>
        <p className="mt-1 text-sm text-muted">
          {formatUSD(result.grossCents)} paid to {DEMO_MERCHANT.name}.
        </p>
      </div>

      <dl className="mt-8 lg:mt-6 divide-y divide-line rounded-(--radius-card) bg-raised px-5 text-sm">
        <Row label="Payment ID" value={result.paymentId} />
        <Row label="Method" value={methodLabel} />
        <Row label="Customer" value={email} />
        <Row label="Paylane fee" value={`− ${formatUSD(result.feeCents)}`} />
        <Row
          label="Settled to"
          value={`${networkLabel(result.network)} · ${shortAddress(result.walletAddress)}`}
        />
        <div className="flex items-baseline justify-between gap-4 py-3.5 lg:py-2.5">
          <dt className="text-muted">Settled in USDC</dt>
          <dd className="num text-base text-success">
            {formatUSDC(result.usdcMicro)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-5">
        <ButtonLink href="/dashboard" size="lg" className="flex-1">
          View in dashboard
        </ButtonLink>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onNewPayment}
        >
          New payment
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-faint">
        Demo only: no money moved. The payment is listed on the dashboard with
        your email and wallet partly hidden.
      </p>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5 lg:py-2.5">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="num min-w-0 truncate text-right">{value}</dd>
    </div>
  );
}
