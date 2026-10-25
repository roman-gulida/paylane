import { beforeEach, describe, expect, it } from "vitest";
import { calculateSettlement } from "../fees";
import { buildFailedOrder, buildPaidOrder } from "../orders";
import { demoWallet } from "../wallet";
import { openDatabase } from "./db";
import { createPaymentsRepo, hashOwner, MAX_PAYMENTS } from "./payments-repo";

const wallet = { ...demoWallet("base"), address: "0x71C7…976F" };

function input(id: string, createdAt: string) {
  return {
    id,
    createdAt,
    customer: "a**@example.com",
    method: "card" as const,
    brand: "visa" as const,
    last4: "4242",
    wallet,
  };
}

function paid(id: string, createdAt: string, cents = 100_000) {
  return buildPaidOrder(input(id, createdAt), {
    status: "succeeded",
    paymentId: id,
    ...calculateSettlement(cents),
    walletAddress: wallet.address,
    network: "base",
  });
}

let repo: ReturnType<typeof createPaymentsRepo>;
const ana = hashOwner("ana-ana-ana-ana-ana");
const ben = hashOwner("ben-ben-ben-ben-ben");

beforeEach(async () => {
  repo = createPaymentsRepo(await openDatabase(":memory:"));
});

describe("payments repo", () => {
  it("saves a payment and reads back every field", async () => {
    await repo.insert(paid("pl_1", "2026-10-20T10:00:00.000Z"), ana);
    const [order] = await repo.list(ana);
    expect(order).toMatchObject({
      id: "pl_1",
      status: "succeeded",
      grossCents: 100_000,
      feeCents: 2_100,
      usdcMicro: 979_000_000,
      customer: "a**@example.com",
      network: "base",
      walletAddress: "0x71C7…976F",
      mine: true,
    });
  });

  it("keeps a decline with its reason and nothing settled", async () => {
    await repo.insert(
      buildFailedOrder(
        input("pl_f", "2026-10-20T10:00:00.000Z"),
        5_000,
        "Insufficient funds",
      ),
      ana,
    );
    const [order] = await repo.list();
    expect(order.status).toBe("failed");
    expect(order.failureReason).toBe("Insufficient funds");
    expect(order.usdcMicro).toBe(0);
  });

  it("lists newest first and flags only the viewer's own", async () => {
    await repo.insert(paid("pl_old", "2026-10-19T10:00:00.000Z"), ben);
    await repo.insert(paid("pl_new", "2026-10-20T10:00:00.000Z"), ana);
    expect((await repo.list(ana)).map((o) => [o.id, o.mine])).toEqual([
      ["pl_new", true],
      ["pl_old", false],
    ]);
    expect((await repo.list()).every((o) => !o.mine)).toBe(true);
  });

  it("deletes only the caller's payments", async () => {
    await repo.insert(paid("pl_a", "2026-10-20T10:00:00.000Z"), ana);
    await repo.insert(paid("pl_b", "2026-10-20T11:00:00.000Z"), ben);
    expect(await repo.deleteByOwner(ana)).toBe(1);
    expect((await repo.list()).map((o) => o.id)).toEqual(["pl_b"]);
    expect(await repo.deleteByOwner(ana)).toBe(0);
  });

  it("keeps only the newest rows", async () => {
    const base = Date.parse("2026-10-01T00:00:00Z");
    for (let i = 0; i < MAX_PAYMENTS + 5; i++) {
      await repo.insert(
        paid(`pl_${i}`, new Date(base + i * 60_000).toISOString()),
        ana,
      );
    }
    expect(await repo.count()).toBe(MAX_PAYMENTS);
    expect((await repo.list())[0].id).toBe(`pl_${MAX_PAYMENTS + 4}`);
  });

  it("stores only a hash of the owner token", async () => {
    expect(hashOwner("ana-ana-ana-ana-ana")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashOwner("ana-ana-ana-ana-ana")).not.toContain("ana");
  });
});
