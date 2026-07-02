/**
 * Payment Intents API
 *   POST /api/payments/intents   — create / get / cancel payment intent
 *
 * Body: { action: "create" | "get" | "cancel", orderId, asset?, payToken? }
 * Auth: user JWT (owner) OR payToken (guest)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { verifyPayToken, getPayTokenSecret } from "@/lib/payments";
import {
  handleCreatePaymentIntent,
  handleGetPaymentIntent,
  handleCancelPaymentIntent,
} from "@/lib/payments/handlers";
import type { CryptoAssetId } from "@/lib/payments/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, asset, payToken } = body as {
      action: "create" | "get" | "cancel";
      orderId: string;
      asset?: CryptoAssetId;
      payToken?: string;
    };

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing action or orderId" }, { status: 400 });
    }

    // Verify payToken if provided
    let guestOrderId: string | null = null;
    if (payToken) {
      try {
        const secret = getPayTokenSecret();
        const result = verifyPayToken(payToken, secret, orderId);
        if (result) guestOrderId = result.orderId;
      } catch {
        // PAY_TOKEN_SECRET not configured
      }
      if (!guestOrderId) {
        return NextResponse.json({ error: "Invalid pay token" }, { status: 403 });
      }
    }

    const session = await getSession();
    if (!session && !guestOrderId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const ctx = {
      userId: session?.id,
      isAdmin: session?.role === "ADMIN",
      payToken: guestOrderId,
    };

    switch (action) {
      case "create": {
        if (!asset) {
          return NextResponse.json({ error: "Missing asset" }, { status: 400 });
        }
        const intent = await handleCreatePaymentIntent(orderId, asset, ctx);
        return NextResponse.json({ intent });
      }
      case "get": {
        const result = await handleGetPaymentIntent(orderId, ctx);
        return NextResponse.json(result);
      }
      case "cancel": {
        const result = await handleCancelPaymentIntent(orderId, ctx);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    console.error("POST /api/payments/intents error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Payment intent operation failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/intents?orderId=X&payToken=Y
 * Convenience endpoint for fetching an intent without a POST body
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    const payToken = url.searchParams.get("payToken");
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

    const result = await handleGetPaymentIntent(orderId, {
      userId: session?.id,
      isAdmin: session?.role === "ADMIN",
      payToken: guestOrderId,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/payments/intents error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch intent" },
      { status: 500 }
    );
  }
}
