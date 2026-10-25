import { NextResponse } from "next/server";
import { z } from "zod";
import { mergeTransactions } from "@/lib/analytics";
import { transactions as sample } from "@/lib/mock-data";
import { getDb } from "@/lib/server/db";
import { createPaymentsRepo } from "@/lib/server/payments-repo";
import { statusSchema, type Transaction } from "@/lib/types";

const querySchema = z.object({
  status: statusSchema.optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(["date", "amount"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** GET /api/transactions?status=failed&q=atlas&sort=amount&order=desc */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { status, q, sort, order } = parsed.data;
  const needle = q?.toLowerCase();

  // Sample data plus every payment made on /pay
  const saved = (await createPaymentsRepo(await getDb()).list()).map(
    (order): Transaction => {
      const { mine, ...transaction } = order;
      void mine;
      return transaction;
    },
  );
  const all = mergeTransactions(saved, sample);

  const data = all
    .filter((t) => !status || t.status === status)
    .filter(
      (t) =>
        !needle ||
        t.customer.toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle),
    )
    .sort((a, b) => {
      const diff =
        sort === "amount"
          ? a.grossCents - b.grossCents
          : a.createdAt.localeCompare(b.createdAt);
      return order === "asc" ? diff : -diff;
    });

  return NextResponse.json({ data, total: data.length });
}
