import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateSettlement, FEE_CONFIG } from "@/lib/fees";

const querySchema = z.object({
  amountCents: z.coerce.number().int().min(0).max(10_000_000),
});

/** GET /api/rates?amountCents=10000 => fee and USDC settlement for that amount */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid amount", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return NextResponse.json({
    fee: {
      percentBps: FEE_CONFIG.percentBps,
      fixedCents: FEE_CONFIG.fixedCents,
    },
    ...calculateSettlement(parsed.data.amountCents),
  });
}
