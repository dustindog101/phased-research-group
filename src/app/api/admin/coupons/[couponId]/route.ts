import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  await requireAdmin();
  const { couponId } = await params;
  try {
    const body = await req.json();
    const allowed = ["discountType", "value", "minOrder", "maxUses", "isActive", "startsAt", "expiresAt"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        if (key === "value" || key === "minOrder") data[key] = parseFloat(body[key]);
        else if (key === "maxUses") data[key] = body[key] ? parseInt(body[key]) : null;
        else if (key === "startsAt" || key === "expiresAt") data[key] = body[key] ? new Date(body[key]) : null;
        else data[key] = body[key];
      }
    }
    const coupon = await db.coupon.update({ where: { id: couponId }, data });
    return NextResponse.json({ coupon });
  } catch (e) {
    console.error("PATCH /api/admin/coupons error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  await requireAdmin();
  const { couponId } = await params;
  try {
    await db.coupon.delete({ where: { id: couponId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/coupons error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to delete coupon" }, { status: 500 });
  }
}
