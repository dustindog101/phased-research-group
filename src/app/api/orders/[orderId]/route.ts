/**
 * Single Order API
 *   GET    /api/orders/:id   — get order (owner / admin / guest with payToken)
 *   PATCH  /api/orders/:id   — admin update order status, tracking, notes
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { verifyPayToken, getPayTokenSecret } from "@/lib/payments";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await getSession();

  const url = new URL(req.url);
  const payToken = url.searchParams.get("payToken");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, paymentIntent: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Access control: admin always; owner always; guest with valid payToken
  const isAdmin = session?.role === "ADMIN";
  const isOwner = order.userId === session?.id;
  let guestAccess = false;
  if (payToken) {
    try {
      const secret = getPayTokenSecret();
      guestAccess = verifyPayToken(payToken, secret, orderId) !== null;
    } catch {
      // PAY_TOKEN_SECRET not configured
    }
  }

  if (!isAdmin && !isOwner && !guestAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = [
    "status",
    "paymentStatus",
    "trackingNumber",
    "customerNotice",
    "adminNotes",
    "paymentExpiresAt",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const order = await db.order.update({
    where: { id: orderId },
    data,
    include: { items: true },
  });
  return NextResponse.json({ order });
}
