import { describe, expect, it } from "vitest";
import { calculateSettlement } from "./fees";
import { buildFailedOrder, buildPaidOrder } from "./orders";
import { DEMO_WALLET } from "./wallet";

const input = {
  id: "pl_abc",
  createdAt: "2026-10-12T10:00:00.000Z",
  customer: "a**@example.com",
  method: "card" as const,
  brand: "visa" as const,
  last4: "4242",
  wallet: DEMO_WALLET,
};

describe("order building", () => {
  it("keeps the settlement the API returned", () => {
    const s = calculateSettlement(100_000);
    const order = buildPaidOrder(input, {
      status: "succeeded",
      paymentId: "pl_abc",
      ...s,
      walletAddress: DEMO_WALLET.address,
      network: "base",
    });
    expect(order.status).toBe("succeeded");
    expect(order.grossCents).toBe(100_000);
    expect(order.feeCents).toBe(2_100);
    expect(order.usdcMicro).toBe(979_000_000);
    expect(order.walletAddress).toBe(DEMO_WALLET.address);
    expect(order.network).toBe("base");
    expect(order.customer).toBe("a**@example.com");
  });

  it("lists a decline with nothing settled and the reason", () => {
    const order = buildFailedOrder(input, 5_000, "Insufficient funds");
    expect(order.status).toBe("failed");
    expect(order.grossCents).toBe(5_000);
    expect(order.feeCents + order.netCents + order.usdcMicro).toBe(0);
    expect(order.failureReason).toBe("Insufficient funds");
    expect(order.network).toBe("base");
  });
});
