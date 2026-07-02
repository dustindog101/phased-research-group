import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  try {
    const body = await req.json();
    if (!body.code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    const code = String(body.code).toUpperCase().trim();
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });

    const coupon = await db.coupon.create({
      data: {
        code,
        discountType: body.discountType ?? "PERCENT",
        value: parseFloat(body.value),
        minOrder: parseFloat(body.minOrder ?? 0),
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        isActive: body.isActive ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json({ coupon });
  } catch (e) {
    console.error("POST /api/admin/coupons error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to create coupon" }, { status: 500 });
  }
}
