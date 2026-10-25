"use client";

import {
  CreditCard,
  Lock,
  LoaderCircle,
  Smartphone,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { cvcLength } from "@/lib/card";
import { brandLabel, formatUSD, type CardBrand } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

export type FieldKey = "email" | "card" | "expiry" | "cvc";
export type FieldErrors = Partial<Record<FieldKey, string>>;

export interface FormValues {
  email: string;
  /** Formatted as typed: "4242 4242 4242 4242" */
  card: string;
  /** Formatted as typed: "12 / 28" */
  expiry: string;
  cvc: string;
}

/** Stripe-style test numbers; they behave as documented in /api/checkout */
export const TEST_CARDS = [
  { label: "Approved", number: "4242424242424242" },
  { label: "Declined", number: "4000000000000002" },
  { label: "No funds", number: "4000000000009995" },
] as const;

const METHODS: { id: PaymentMethod; label: string; Icon: typeof CreditCard }[] =
  [
    { id: "card", label: "Card", Icon: CreditCard },
    { id: "apple_pay", label: "Apple Pay", Icon: Smartphone },
    { id: "google_pay", label: "Google Pay", Icon: Wallet },
  ];

const WALLET_NAME: Record<Exclude<PaymentMethod, "card">, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
};

export function PaymentForm({
  method,
  onMethodChange,
  values,
  errors,
  brand,
  cents,
  amountInvalid,
  processing,
  failure,
  onChange,
  onBlur,
  onFillTestCard,
  onSubmit,
}: {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  values: FormValues;
  errors: FieldErrors;
  brand: CardBrand | null;
  cents: number;
  amountInvalid: boolean;
  processing: boolean;
  /** Message from a declined or failed attempt */
  failure?: string;
  onChange: (field: FieldKey, value: string) => void;
  onBlur: (field: FieldKey) => void;
  onFillTestCard: (number: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const wallet = method === "card" ? null : WALLET_NAME[method];

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="payment-title"
      className="w-full"
    >
      <h2 id="payment-title" className="sr-only">
        Payment details
      </h2>

      <fieldset disabled={processing} className="mt-6 min-w-0 lg:mt-5">
        <legend className="sr-only">Payment method</legend>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(({ id, label, Icon }) => (
            <label key={id} className="relative cursor-pointer">
              <input
                type="radio"
                name="method"
                value={id}
                checked={method === id}
                onChange={() => onMethodChange(id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-sm lg:h-14 lg:gap-1",
                  "bg-raised text-fg/80 ring-1 ring-transparent transition",
                  "hover:bg-hover hover:text-fg",
                  "peer-checked:bg-accent/10 peer-checked:text-accent peer-checked:ring-accent/50",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 space-y-4 lg:mt-4 lg:space-y-3">
        <Input
          className="lg:h-11"
          id="pay-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => onBlur("email")}
          disabled={processing}
          error={errors.email}
        />

        {method === "card" ? (
          <>
            <Input
              className="lg:h-11"
              id="pay-card"
              label="Card number"
              mono
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={values.card}
              onChange={(e) => onChange("card", e.target.value)}
              onBlur={() => onBlur("card")}
              disabled={processing}
              error={errors.card}
              hint={brand ? brandLabel(brand) : undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                className="lg:h-11"
                id="pay-expiry"
                label="Expiry"
                mono
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                value={values.expiry}
                onChange={(e) => onChange("expiry", e.target.value)}
                onBlur={() => onBlur("expiry")}
                disabled={processing}
                error={errors.expiry}
              />
              <Input
                className="lg:h-11"
                id="pay-cvc"
                label="Security code"
                mono
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={cvcLength(brand) === 4 ? "1234" : "123"}
                value={values.cvc}
                onChange={(e) => onChange("cvc", e.target.value)}
                onBlur={() => onBlur("cvc")}
                disabled={processing}
                error={errors.cvc}
              />
            </div>

            <div className="rounded-xl bg-raised/60 p-3 lg:p-2.5">
              <p className="text-xs text-faint">
                Demo mode. Fill in a test card:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.number}
                    type="button"
                    disabled={processing}
                    onClick={() => onFillTestCard(card.number)}
                    className="num h-8 cursor-pointer rounded-full bg-raised px-3 text-xs text-fg/80 transition-colors not-disabled:hover:bg-hover not-disabled:hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {card.label}
                    <span className="ml-1.5 text-faint">
                      ··{card.number.slice(-4)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-raised/60 p-4 text-sm text-muted">
            In this demo, {wallet} confirms instantly with a test Visa ending in
            4242. No real wallet is opened.
          </p>
        )}
      </div>

      {failure && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl bg-failed/10 px-3.5 py-2.5 text-sm text-failed lg:mt-3"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-medium">{failure.replace(/\.$/, "")}.</span>{" "}
            <span className="text-failed/80">You were not charged</span>
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full lg:mt-4"
        disabled={processing || amountInvalid}
      >
        {processing ? (
          <>
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
            Processing…
          </>
        ) : wallet ? (
          `Pay ${formatUSD(cents)} with ${wallet}`
        ) : (
          `Pay ${formatUSD(cents)}`
        )}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-faint lg:mt-3">
        <Lock aria-hidden className="size-3.5" />
        Demo only. Never enter a real card number
      </p>
    </form>
  );
}
