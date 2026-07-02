/**
 * Pay Session API — mints HMAC pay token for guest crypto invoice access
 * Ported from nextjs-boilerplate app/api/payments/pay-session/route.ts
 *
 * Guests without a login JWT can pay a crypto invoice via a short-lived
 * HMAC token bound to their orderId. The token is sent to the client and
 * included in subsequent /api/payments/intents and /api/payments/poll calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { signPayToken, getPayTokenSecret } from "@/lib/payments";
import { isCryptoOrder, isOrderUnpaid } from "@/lib/payments/orderHelpers";

// Simple in-memory rate limiter (per IP + orderId)
const recentMints = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.orderId as string | undefined;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const clientKey = `${ip}:${orderId}`;
    const now = Date.now();
    const recent = (recentMints.get(clientKey) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    recent.push(now);
    recentMints.set(clientKey, recent);

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        cryptoAsset: true,
        paymentIntentId: true,
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!isCryptoOrder(order)) {
      return NextResponse.json({ error: "Order is not a crypto order" }, { status: 400 });
    }
    if (!isOrderUnpaid(order)) {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    const secret = getPayTokenSecret();
    const ttlSeconds = 48 * 60 * 60;
    const payToken = signPayToken(orderId, secret, ttlSeconds);
    const expiresAt = new Date(now + ttlSeconds * 1000).toISOString();

    return NextResponse.json({ payToken, expiresAt });
  } catch (e) {
    console.error("POST /api/payments/pay-session error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to mint pay token" },
      { status: 500 }
    );
  }
}
