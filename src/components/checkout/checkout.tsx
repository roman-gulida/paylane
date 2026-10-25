"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  amountToCents,
  MAX_AMOUNT_CENTS,
  MIN_AMOUNT_CENTS,
} from "@/lib/amount";
import {
  detectBrand,
  digitsOnly,
  expiryForApi,
  validateCardNumber,
  validateCvc,
  validateEmail,
  validateExpiry,
} from "@/lib/card";
import {
  describeMethod,
  formatCardNumber,
  formatExpiry,
  formatUSD,
  type CardBrand,
} from "@/lib/format";
import { refreshLiveOrders } from "@/lib/live-orders";
import { DIGITAL_WALLET_CARD } from "@/lib/orders";
import { getOwnerToken } from "@/lib/owner";
import {
  checkoutFailureSchema,
  checkoutSuccessSchema,
  type CheckoutSuccess,
  type PaymentMethod,
} from "@/lib/types";
import { walletStore, useSettlementWallet } from "@/lib/wallet-store";
import type { SettlementWallet } from "@/lib/wallet";
import { OrderSummary } from "./order-summary";
import {
  PaymentForm,
  type FieldErrors,
  type FieldKey,
  type FormValues,
} from "./payment-form";
import { Receipt } from "./receipt";
import { Stepper, type Step } from "./stepper";
import { WalletStep } from "./wallet-step";

type Status =
  | { kind: "idle" }
  | { kind: "processing" }
  | { kind: "failed"; message: string }
  | {
      kind: "paid";
      result: CheckoutSuccess;
      methodLabel: string;
      email: string;
    };

const FIELD_ORDER: FieldKey[] = ["email", "card", "expiry", "cvc"];
const FIELD_ID: Record<FieldKey, string> = {
  email: "pay-email",
  card: "pay-card",
  expiry: "pay-expiry",
  cvc: "pay-cvc",
};

const EMPTY: FormValues = { email: "", card: "", expiry: "", cvc: "" };

function validateField(
  field: FieldKey,
  v: FormValues,
  now: Date,
): string | undefined {
  const brand = detectBrand(digitsOnly(v.card));
  switch (field) {
    case "email":
      return validateEmail(v.email);
    case "card":
      return validateCardNumber(digitsOnly(v.card));
    case "expiry":
      return validateExpiry(v.expiry, now);
    case "cvc":
      return validateCvc(v.cvc, brand);
  }
}

export function Checkout() {
  const [amountRaw, setAmountRaw] = useState("1000");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [step, setStep] = useState<Step>("wallet");
  // The merchant's settlement wallet (where the USDC lands). Saved in this browser
  const wallet = useSettlementWallet();
  const activeStep: Step = step === "payment" && wallet ? "payment" : "wallet";

  // Next keeps a visited page alive (hidden) while you browse elsewhere. Leaving
  // after a payment should give a fresh form next time, not the old receipt,
  // and coming back always starts at step 1 with the saved wallet filled in
  useEffect(
    () => () => {
      setStatus((s) => (s.kind === "paid" ? { kind: "idle" } : s));
      setStep("wallet");
    },
    [],
  );

  // Amount: invalid input shows an error, but the page keeps a sensible clamped number
  const typedCents = amountToCents(amountRaw);
  const amountError =
    typedCents < MIN_AMOUNT_CENTS
      ? `Minimum payment is ${formatUSD(MIN_AMOUNT_CENTS)} in this demo.`
      : typedCents > MAX_AMOUNT_CENTS
        ? `Maximum payment is ${formatUSD(MAX_AMOUNT_CENTS)} in this demo.`
        : undefined;
  const cents = Math.min(
    MAX_AMOUNT_CENTS,
    Math.max(MIN_AMOUNT_CENTS, typedCents),
  );

  const cardDigits = digitsOnly(values.card);
  const brand = detectBrand(cardDigits);
  const processing = status.kind === "processing";
  const paid = status.kind === "paid";

  /** Only fields that currently show an error are re-checked while typing */
  function handleChange(field: FieldKey, raw: string) {
    let value = raw;
    if (field === "card") value = formatCardNumber(raw);
    if (field === "expiry") value = formatExpiry(raw);
    if (field === "cvc") value = digitsOnly(raw).slice(0, 4);

    const next = { ...values, [field]: value };
    setValues(next);
    if (status.kind === "failed") setStatus({ kind: "idle" });
    if (errors[field]) {
      setErrors((e) => ({
        ...e,
        [field]: validateField(field, next, new Date()),
      }));
    }
  }

  function handleBlur(field: FieldKey) {
    // Don't nag about a field the visitor tabbed through without typing
    if (!values[field]) return;
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, values, new Date()),
    }));
  }

  function fillTestCard(number: string) {
    const yy = (new Date().getUTCFullYear() + 3) % 100;
    setValues((v) => ({
      email: v.email || "customer@example.com",
      card: formatCardNumber(number),
      expiry: formatExpiry(`12${String(yy).padStart(2, "0")}`),
      cvc: "123",
    }));
    setErrors({});
    if (status.kind === "failed") setStatus({ kind: "idle" });
  }

  function changeMethod(next: PaymentMethod) {
    setMethod(next);
    setErrors({});
    if (status.kind === "failed") setStatus({ kind: "idle" });
  }

  function continueFromWallet(next: SettlementWallet) {
    walletStore.set(next);
    setStep("payment");
  }

  function editWallet() {
    if (status.kind === "failed") setStatus({ kind: "idle" });
    setStep("wallet");
  }

  function newPayment() {
    setValues((v) => ({ ...EMPTY, email: v.email }));
    setErrors({});
    setStatus({ kind: "idle" });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (processing || paid || amountError) return;
    if (!wallet) {
      setStep("wallet");
      return;
    }

    const now = new Date();
    const fields: FieldKey[] = method === "card" ? FIELD_ORDER : ["email"];
    const found: FieldErrors = {};
    for (const f of fields) {
      const message = validateField(f, values, now);
      if (message) found[f] = message;
    }
    setErrors(found);
    const firstInvalid = fields.find((f) => found[f]);
    if (firstInvalid) {
      document.getElementById(FIELD_ID[firstInvalid])?.focus();
      return;
    }

    setStatus({ kind: "processing" });

    const isCard = method === "card";
    const email = values.email.trim();
    const cardBrand: CardBrand = isCard
      ? (brand ?? "visa")
      : DIGITAL_WALLET_CARD.brand;
    const last4 = isCard ? cardDigits.slice(-4) : DIGITAL_WALLET_CARD.last4;

    try {
      // The server saves the payment (paid or declined) for the dashboard
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: cents,
          method,
          email,
          walletAddress: wallet.address,
          network: wallet.network,
          ownerToken: getOwnerToken(),
          ...(isCard && {
            cardNumber: cardDigits,
            expiry: expiryForApi(values.expiry),
            cvc: values.cvc,
          }),
        }),
      });
      const body: unknown = await res.json().catch(() => null);

      const success = checkoutSuccessSchema.safeParse(body);
      if (res.ok && success.success) {
        void refreshLiveOrders();
        // The card details are no longer needed: don't keep them in memory
        setValues((v) => ({ ...EMPTY, email: v.email }));
        setStatus({
          kind: "paid",
          result: success.data,
          methodLabel: describeMethod(method, cardBrand, last4),
          email,
        });
        return;
      }

      const failure = checkoutFailureSchema.safeParse(body);
      if (failure.success) {
        void refreshLiveOrders();
        setStatus({ kind: "failed", message: failure.data.reason });
        return;
      }

      setStatus({
        kind: "failed",
        message:
          res.status === 429
            ? "Too many attempts. Wait a moment and try again"
            : "Something went wrong on our side",
      });
    } catch {
      setStatus({
        kind: "failed",
        message: "We couldn't reach Paylane. Check your connection",
      });
    }
  }

  return (
    <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
      <OrderSummary
        amountRaw={amountRaw}
        onAmountChange={setAmountRaw}
        cents={cents}
        error={amountError}
        locked={processing || paid}
        wallet={wallet}
        onEditWallet={editWallet}
      />

      <div className="rounded-t-3xl bg-surface px-4 py-8 shadow-(--shadow-card) sm:px-10 lg:flex lg:items-center lg:rounded-none lg:px-14 lg:py-8 short:py-5">
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:mr-auto">
          {status.kind === "paid" ? (
            <Receipt
              result={status.result}
              methodLabel={status.methodLabel}
              email={status.email}
              onNewPayment={newPayment}
            />
          ) : (
            <>
              <Stepper
                step={activeStep}
                onEditWallet={editWallet}
                disabled={processing}
              />
              {activeStep === "wallet" ? (
                <WalletStep
                  // Remount when the saved wallet loads, so the form starts filled in
                  key={wallet ? wallet.address + wallet.network : "none"}
                  initial={wallet}
                  onContinue={continueFromWallet}
                />
              ) : (
                <PaymentForm
                  method={method}
                  onMethodChange={changeMethod}
                  values={values}
                  errors={errors}
                  brand={brand}
                  cents={cents}
                  amountInvalid={Boolean(amountError)}
                  processing={processing}
                  failure={
                    status.kind === "failed" ? status.message : undefined
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFillTestCard={fillTestCard}
                  onSubmit={handleSubmit}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
