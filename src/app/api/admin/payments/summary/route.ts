import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleGetPaymentActivitySummary } from "@/lib/payments/adminActivity";

export async function GET() {
  await requireAdmin();
  try {
    const summary = await handleGetPaymentActivitySummary();
    return NextResponse.json(summary);
  } catch (e) {
    console.error("GET /api/admin/payments/summary error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch summary" }, { status: 500 });
  }
}
