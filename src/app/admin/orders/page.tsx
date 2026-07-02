import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdminOrdersClient } from "@/components/admin/orders-client";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; paymentStatus?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status ?? "all";
  const paymentFilter = sp.paymentStatus ?? "all";
  const query = sp.q?.trim() ?? "";

  const where: Record<string, unknown> = {};
  if (statusFilter !== "all") where.status = statusFilter.toUpperCase();
  if (paymentFilter !== "all") where.paymentStatus = paymentFilter.toUpperCase();
  if (query) {
    where.OR = [
      { orderNumber: { contains: query } },
      { guestEmail: { contains: query } },
      { user: { email: { contains: query } } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true, user: true },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Orders
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <AdminOrdersClient orders={orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userEmail: o.user?.email ?? o.guestEmail ?? "—",
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: o.total,
        itemCount: o.items.length,
      }))} />
    </div>
  );
}
