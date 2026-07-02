/**
 * Admin Order Export API — CSV export of orders
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";

function escapeCsv(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  await requireAdmin();

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status");
  const paymentFilter = url.searchParams.get("paymentStatus");

  const where: Record<string, unknown> = {};
  if (statusFilter && statusFilter !== "all") where.status = statusFilter.toUpperCase();
  if (paymentFilter && paymentFilter !== "all") where.paymentStatus = paymentFilter.toUpperCase();

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true },
    take: 1000,
  });

  const headers = [
    "Order Number", "Date", "Customer Email", "Status", "Payment Status",
    "Payment Method", "Crypto Asset", "Tx Hash", "Subtotal", "Discount",
    "Shipping", "Total", "Coupon", "Shipping Name", "Shipping Address",
    "Shipping City", "Shipping State", "Shipping ZIP", "Item Count", "Tracking Number",
  ];

  const rows = orders.map((o) => {
    const addr = o.shippingAddress as {
      fullName?: string; line1?: string; city?: string; state?: string; zip?: string;
    } | null;
    return [
      o.orderNumber, o.createdAt.toISOString(), o.user?.email ?? o.guestEmail ?? "",
      o.status, o.paymentStatus, o.paymentMethod ?? "", o.cryptoAsset ?? "",
      o.cryptoTxHash ?? "", o.subtotal.toFixed(2), o.discountAmount.toFixed(2),
      o.shipping.toFixed(2), o.total.toFixed(2), o.couponCode ?? "",
      addr?.fullName ?? "", addr?.line1 ?? "", addr?.city ?? "", addr?.state ?? "",
      addr?.zip ?? "", o.items.length, o.trackingNumber ?? "",
    ].map(escapeCsv).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prg-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
