import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleListPaymentIntents } from "@/lib/payments/adminActivity";

export async function GET(req: NextRequest) {
  await requireAdmin();
  try {
    const url = new URL(req.url);
    const result = await handleListPaymentIntents({
      status: url.searchParams.get("status") ?? undefined,
      asset: url.searchParams.get("asset") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      limit: parseInt(url.searchParams.get("limit") ?? "50"),
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/admin/payments/intents error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch intents" }, { status: 500 });
  }
}
