import type { CardBrand } from "./format";
import {
  transactionSchema,
  type CheckoutSuccess,
  type PaymentMethod,
  type Transaction,
} from "./types";
import type { SettlementWallet } from "./wallet";

/** Builds the records the server saves for each payment attempt */

export const DEMO_MERCHANT = {
  name: "Brightlane Studio",
  description: "Design retainer · INV-2041",
} as const;

/** Apple Pay and Google Pay in the demo are backed by a test Visa */
export const DIGITAL_WALLET_CARD = {
  brand: "visa" as CardBrand,
  last4: "4242",
};

export interface OrderInput {
  id: string;
  createdAt: string;
  /** What gets saved and shown to every visitor. Pass it already masked */
  customer: string;
  method: PaymentMethod;
  brand: CardBrand;
  last4: string;
  /** The wallet as it should be saved. Pass the address already shortened */
  wallet: SettlementWallet;
}

/** A paid order, built from the settlement the API calculated */
export function buildPaidOrder(
  input: OrderInput,
  result: CheckoutSuccess,
): Transaction {
  return transactionSchema.parse({
    id: result.paymentId,
    createdAt: input.createdAt,
    customer: input.customer,
    description: DEMO_MERCHANT.description,
    method: input.method,
    brand: input.brand,
    last4: input.last4,
    status: "succeeded",
    grossCents: result.grossCents,
    feeCents: result.feeCents,
    netCents: result.netCents,
    usdcMicro: result.usdcMicro,
    network: input.wallet.network,
    walletAddress: input.wallet.address,
  });
}

/** A declined attempt: it is listed, but nothing is charged or settled */
export function buildFailedOrder(
  input: OrderInput,
  grossCents: number,
  reason: string,
): Transaction {
  return transactionSchema.parse({
    id: input.id,
    createdAt: input.createdAt,
    customer: input.customer,
    description: DEMO_MERCHANT.description,
    method: input.method,
    brand: input.brand,
    last4: input.last4,
    status: "failed",
    grossCents,
    feeCents: 0,
    netCents: 0,
    usdcMicro: 0,
    failureReason: reason,
    network: input.wallet.network,
    walletAddress: input.wallet.address,
  });
}
