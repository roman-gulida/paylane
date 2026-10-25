import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { createPaymentsRepo, hashOwner } from "@/lib/server/payments-repo";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

/**
 * Payments made on /pay, shared by every visitor
 *
 *   GET    /api/orders   newest first; `mine` is true for the caller's own
 *   DELETE /api/orders   removes only the caller's own payments
 *
 * The caller identifies itself with an `x-paylane-owner` header: a random
 * token its browser made up. Only the hash of that token is stored
 */
const NO_STORE = { "Cache-Control": "no-store" };

function ownerFrom(request: Request): string | undefined {
  const token = request.headers.get("x-paylane-owner") ?? "";
  return token.length >= 16 && token.length <= 64
    ? hashOwner(token)
    : undefined;
}

export async function GET(request: Request) {
  const limit = rateLimit(`orders:${clientKey(request)}`, 120, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          ...NO_STORE,
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }
  const data = await createPaymentsRepo(await getDb()).list(ownerFrom(request));
  return NextResponse.json({ data }, { headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const owner = ownerFrom(request);
  if (!owner) {
    return NextResponse.json(
      { error: "Missing x-paylane-owner header" },
      { status: 400, headers: NO_STORE },
    );
  }
  const limit = rateLimit(`orders-delete:${clientKey(request)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: NO_STORE },
    );
  }
  const deleted = await createPaymentsRepo(await getDb()).deleteByOwner(owner);
  return NextResponse.json({ deleted }, { headers: NO_STORE });
}
