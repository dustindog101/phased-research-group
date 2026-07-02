/**
 * Vercel Cron — daily payment watcher reconciliation
 *
 * Runs via Vercel Cron config in vercel.json:
 *   { "crons": [{ "path": "/api/cron/payment-watcher", "schedule": "0 9 * * *" }] }
 *
 * - Expires stale intents (PENDING/DETECTED past expiresAt)
 * - Reconciles missed payments (polls chains for all active intents)
 *
 * Real-time detection happens via client-side polling (/api/payments/poll)
 * while the CryptoPayModal is open. This daily cron is a safety net.
 */

import { NextRequest, NextResponse } from "next/server";
import { runWatcher } from "@/lib/payments/watcher";

export async function GET(req: NextRequest) {
  // Verify CRON_SECRET if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const provided = authHeader?.replace("Bearer ", "");
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runWatcher();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
