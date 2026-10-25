import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { detectBrand } from "@/lib/card";
import { calculateSettlement } from "@/lib/fees";
import {
  buildFailedOrder,
  buildPaidOrder,
  DIGITAL_WALLET_CARD,
  type OrderInput,
} from "@/lib/orders";
import { maskEmail } from "@/lib/privacy";
import { getDb } from "@/lib/server/db";
import { createPaymentsRepo, hashOwner } from "@/lib/server/payments-repo";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { checkoutRequestSchema, type Transaction } from "@/lib/types";
import { shortAddress } from "@/lib/wallet";

/**
 * POST /api/checkout — demo payment endpoint. No real payments are made, but
 * every attempt (paid or declined) is saved so the dashboard can list it
 *
 * Test cards:
 *   4242 4242 4242 4242  => succeeds
 *   4000 0000 0000 0002  => declined
 *   4000 0000 0000 9995  => insufficient funds
 *   anything else        => succeeds
 * Apple Pay / Google Pay always succeed in the demo.
 *
 * What is saved is masked, because the dashboard is shared by every visitor:
 * the email becomes "a**@example.com" and the wallet "0x71C7…976F"
 */
const DECLINES: Record<string, string> = {
  "4000000000000002": "Card declined by issuer",
  "4000000000009995": "Insufficient funds",
};

/** 20 attempts a minute per visitor address is plenty for a demo */
const LIMIT = 20;
const WINDOW_MS = 60_000;

function isExpired(expiry: string): boolean {
  const [mm, yy] = expiry.split("/").map(Number);
  if (!mm || mm < 1 || mm > 12) return true;
  const endOfMonth = new Date(Date.UTC(2000 + yy, mm, 1));
  return endOfMonth.getTime() <= Date.now();
}

function newPaymentId(): string {
  return `pl_${Date.now().toString(36)}${randomUUID().replaceAll("-", "").slice(0, 5)}`;
}

export async function POST(request: Request) {
  const limit = rateLimit(`checkout:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const {
    amountCents,
    method,
    cardNumber,
    expiry,
    email,
    walletAddress,
    network,
    ownerToken,
  } = parsed.data;

  if (method === "card" && (!cardNumber || !expiry || !parsed.data.cvc)) {
    return NextResponse.json(
      { error: "Card details are required" },
      { status: 400 },
    );
  }

  const repo = createPaymentsRepo(await getDb());
  const ownerHash = hashOwner(ownerToken);

  const isCard = method === "card";
  const input: OrderInput = {
    id: newPaymentId(),
    createdAt: new Date().toISOString(),
    customer: maskEmail(email),
    method,
    brand: isCard
      ? (detectBrand(cardNumber ?? "") ?? "visa")
      : DIGITAL_WALLET_CARD.brand,
    last4: isCard ? (cardNumber ?? "").slice(-4) : DIGITAL_WALLET_CARD.last4,
    wallet: { address: shortAddress(walletAddress), network },
  };

  const decline = async (reason: string) => {
    await repo.insert(buildFailedOrder(input, amountCents, reason), ownerHash);
    return NextResponse.json({ status: "failed", reason }, { status: 402 });
  };

  if (isCard && cardNumber && expiry) {
    if (isExpired(expiry)) return await decline("Card expired");
    const reason = DECLINES[cardNumber];
    if (reason) return await decline(reason);
  }

  // Small artificial delay so the "processing" state is visible in the UI
  await new Promise((resolve) => setTimeout(resolve, 900));

  const settlement = calculateSettlement(amountCents);
  const result = {
    status: "succeeded" as const,
    paymentId: input.id,
    ...settlement,
    // The payer gets their own full address back; only the short form is saved.
    walletAddress,
    network,
  };

  const saved: Transaction = buildPaidOrder(input, result);
  await repo.insert(saved, ownerHash);

  return NextResponse.json(result);
}
