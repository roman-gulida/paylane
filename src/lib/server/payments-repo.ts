import { createHash } from "node:crypto";
import type { Client, Row as DbRow } from "@libsql/client";
import { transactionSchema, type Transaction } from "../types";

/**
 * Payments made on /pay. All visitors share one list, but each payment
 * remembers (as a hash) which browser made it, so "Reset demo" only removes
 * your own and the dashboard can tag them "New".
 */

/** Keep the database small: only the newest rows survive */
export const MAX_PAYMENTS = 300;

export type LiveOrder = Transaction & { mine: boolean };

/** The browser's random token never reaches the database, only its hash */
export function hashOwner(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface Row {
  id: string;
  created_at: string;
  customer: string;
  description: string;
  method: string;
  brand: string;
  last4: string;
  status: string;
  gross_cents: number;
  fee_cents: number;
  net_cents: number;
  usdc_micro: number;
  failure_reason: string | null;
  network: string | null;
  wallet_address: string | null;
  owner_hash: string;
}

function toOrder(row: Row, ownerHash?: string): LiveOrder {
  const tx = transactionSchema.parse({
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer,
    description: row.description,
    method: row.method,
    brand: row.brand,
    last4: row.last4,
    status: row.status,
    grossCents: row.gross_cents,
    feeCents: row.fee_cents,
    netCents: row.net_cents,
    usdcMicro: row.usdc_micro,
    failureReason: row.failure_reason ?? undefined,
    network: row.network ?? undefined,
    walletAddress: row.wallet_address ?? undefined,
  });
  return { ...tx, mine: Boolean(ownerHash) && row.owner_hash === ownerHash };
}

export function createPaymentsRepo(db: Client) {
  return {
    async insert(tx: Transaction, ownerHash: string): Promise<void> {
      // One round trip, all or nothing: save the payment and trim old rows
      await db.batch(
        [
          {
            sql: `INSERT INTO payments (id, created_at, customer, description, method,
              brand, last4, status, gross_cents, fee_cents, net_cents, usdc_micro,
              failure_reason, network, wallet_address, owner_hash)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              tx.id,
              tx.createdAt,
              tx.customer,
              tx.description,
              tx.method,
              tx.brand,
              tx.last4,
              tx.status,
              tx.grossCents,
              tx.feeCents,
              tx.netCents,
              tx.usdcMicro,
              tx.failureReason ?? null,
              tx.network ?? null,
              tx.walletAddress ?? null,
              ownerHash,
            ],
          },
          {
            sql: `DELETE FROM payments WHERE id NOT IN (
              SELECT id FROM payments ORDER BY created_at DESC, id DESC LIMIT ?)`,
            args: [MAX_PAYMENTS],
          },
        ],
        "write",
      );
    },

    /** Newest first. Pass the viewer's hash to flag their own payments */
    async list(ownerHash?: string, limit = MAX_PAYMENTS): Promise<LiveOrder[]> {
      const result = await db.execute({
        sql: "SELECT * FROM payments ORDER BY created_at DESC, id DESC LIMIT ?",
        args: [limit],
      });
      return result.rows.map((r) => toOrder(r as unknown as Row, ownerHash));
    },

    /** Removes only the payments this browser made. Returns how many */
    async deleteByOwner(ownerHash: string): Promise<number> {
      const result = await db.execute({
        sql: "DELETE FROM payments WHERE owner_hash = ?",
        args: [ownerHash],
      });
      return result.rowsAffected;
    },

    async count(): Promise<number> {
      const result = await db.execute("SELECT COUNT(*) AS n FROM payments");
      return Number((result.rows[0] as DbRow).n);
    },
  };
}

export type PaymentsRepo = ReturnType<typeof createPaymentsRepo>;
