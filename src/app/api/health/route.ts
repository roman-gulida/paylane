import { connection, NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { createPaymentsRepo } from "@/lib/server/payments-repo";

/**
 * GET /api/health — used by Docker and the hosting platform to know the app is
 * up. It also reads the database, so a missing or read-only volume shows up here
 */
export async function GET() {
  await connection();
  try {
    const payments = await createPaymentsRepo(await getDb()).count();
    return NextResponse.json(
      { ok: true, payments },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
