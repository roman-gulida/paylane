import { z } from "zod";
import { MAX_AMOUNT_CENTS, MIN_AMOUNT_CENTS } from "./amount";
import { networkSchema, validateWalletAddress } from "./wallet";

export const statusSchema = z.enum([
  "succeeded",
  "pending",
  "failed",
  "refunded",
]);
export type TransactionStatus = z.infer<typeof statusSchema>;

export const brandSchema = z.enum(["visa", "mastercard", "amex"]);

export const methodSchema = z.enum(["card", "apple_pay", "google_pay"]);
export type PaymentMethod = z.infer<typeof methodSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  customer: z.string(),
  description: z.string(),
  method: methodSchema,
  brand: brandSchema,
  last4: z.string().length(4),
  status: statusSchema,
  grossCents: z.number().int().nonnegative(),
  feeCents: z.number().int().nonnegative(),
  netCents: z.number().int().nonnegative(),
  usdcMicro: z.number().int().nonnegative(),
  failureReason: z.string().optional(),
  /** Where the USDC was sent. Only set for payments made on /pay */
  network: networkSchema.optional(),
  walletAddress: z.string().max(100).optional(),
});
export type Transaction = z.infer<typeof transactionSchema>;

/** Body of POST /api/checkout */
export const checkoutRequestSchema = z
  .object({
    amountCents: z.number().int().min(MIN_AMOUNT_CENTS).max(MAX_AMOUNT_CENTS),
    method: methodSchema,
    /** Digits only. Not required for wallet methods */
    cardNumber: z
      .string()
      .regex(/^\d{13,19}$/)
      .optional(),
    expiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/)
      .optional(),
    cvc: z
      .string()
      .regex(/^\d{3,4}$/)
      .optional(),
    email: z.string().email(),
    /** The merchant's settlement wallet. Checked against the chosen network below */
    walletAddress: z.string().max(100),
    network: networkSchema,
    /**
     * A random id this browser made for itself. Only its hash is stored. It lets
     * "Reset demo" remove your own payments without touching anyone else's.
     */
    ownerToken: z.string().min(16).max(64),
  })
  .superRefine((body, ctx) => {
    const message = validateWalletAddress(body.walletAddress, body.network);
    if (message) {
      ctx.addIssue({ code: "custom", path: ["walletAddress"], message });
    }
  });
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** Body of a successful POST /api/checkout response */
export const checkoutSuccessSchema = z.object({
  status: z.literal("succeeded"),
  paymentId: z.string(),
  grossCents: z.number().int().nonnegative(),
  feeCents: z.number().int().nonnegative(),
  netCents: z.number().int().nonnegative(),
  usdcMicro: z.number().int().nonnegative(),
  walletAddress: z.string().max(100),
  network: networkSchema,
});
export type CheckoutSuccess = z.infer<typeof checkoutSuccessSchema>;

/** Body of a declined POST /api/checkout response (HTTP 402) */
export const checkoutFailureSchema = z.object({
  status: z.literal("failed"),
  reason: z.string(),
});

/** Response of GET /api/orders: every saved payment, with `mine` set for the caller's own */
export const liveOrdersResponseSchema = z.object({
  data: z.array(transactionSchema.extend({ mine: z.boolean() })),
});
export type LiveOrderRecord = z.infer<
  typeof liveOrdersResponseSchema
>["data"][number];
