import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("orderNumber")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      guestEmail: true,
      user: { select: { email: true } },
      paymentStatus: true,
      status: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const orderEmail = order.guestEmail ?? order.user?.email;
  if (email && orderEmail?.toLowerCase() !== email) {
    return NextResponse.json({ error: "Email does not match order" }, { status: 403 });
  }

  return NextResponse.json({
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    status: order.status,
  });
}
