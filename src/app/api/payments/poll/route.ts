/**
 * Payment Poll API — client-side real-time detection
 *
 * Called by the CryptoPayModal every 15s while open.
 * Triggers the watcher for a single order and returns current intent status.
 *
 * Auth: user JWT (owner) OR payToken (guest)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { verifyPayToken, getPayTokenSecret } from "@/lib/payments";
import { watchSingleOrder } from "@/lib/payments/watcher";
import { sanitizeIntentForClient } from "@/lib/payments/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, payToken } = body as { orderId: string; payToken?: string };
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    let guestOrderId: string | null = null;
    if (payToken) {
      try {
        const secret = getPayTokenSecret();
        const result = verifyPayToken(payToken, secret, orderId);
        if (result) guestOrderId = result.orderId;
      } catch {
        // ignore
      }
    }

    const session = await getSession();
    if (!session && !guestOrderId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Access control
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, paymentIntentId: true, paymentStatus: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!guestOrderId && order.userId !== session?.id && session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Run watcher for this single order
    const result = await watchSingleOrder(orderId);

    // Return current intent state
    let intent = null;
    if (order.paymentIntentId) {
      const intentRow = await db.paymentIntent.findUnique({
        where: { id: order.paymentIntentId },
      });
      if (intentRow) {
        intent = sanitizeIntentForClient(intentRow);
      }
    }

    return NextResponse.json({
      ...result,
      intent,
      paymentStatus: order.paymentStatus,
    });
  } catch (e) {
    console.error("POST /api/payments/poll error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Poll failed" },
      { status: 500 }
    );
  }
}
