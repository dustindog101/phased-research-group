import { db } from "@/db";
import { AdminCouponsClient } from "@/components/admin/coupons-client";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializable = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    value: c.value,
    minOrder: c.minOrder,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    isActive: c.isActive,
    startsAt: c.startsAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Coupons
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      <AdminCouponsClient coupons={serializable} />
    </div>
  );
}
