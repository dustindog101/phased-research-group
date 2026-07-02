import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/payments/settings";
import { validateGatewaySettings } from "@/lib/payments/validation";
import { db } from "@/db";
import { isCryptoPaymentsEnabled } from "@/lib/payments/constants";

export async function GET() {
  await requireAdmin();
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  await requireAdmin();
  try {
    if (!isCryptoPaymentsEnabled()) {
      return NextResponse.json(
        { error: "Crypto payments are disabled (CRYPTO_PAYMENTS_ENABLED=false)" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paymentGateways, paymentIntentTtlHours } = body as {
      paymentGateways: Record<string, { enabled: boolean; address: string; minConfirmations: number }>;
      paymentIntentTtlHours?: number;
    };

    if (!paymentGateways) {
      return NextResponse.json({ error: "Missing paymentGateways" }, { status: 400 });
    }

    const errors = validateGatewaySettings(paymentGateways);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    let ttl = 48;
    if (paymentIntentTtlHours !== undefined) {
      ttl = parseInt(paymentIntentTtlHours);
      if (ttl < 1 || ttl > 168) {
        return NextResponse.json({ error: "paymentIntentTtlHours must be between 1 and 168" }, { status: 400 });
      }
    }

    const updated = await db.paymentSettings.upsert({
      where: { id: "site" },
      update: {
        paymentGateways: paymentGateways as unknown as Record<string, unknown>,
        paymentIntentTtlHours: ttl,
      },
      create: {
        id: "site",
        paymentGateways: paymentGateways as unknown as Record<string, unknown>,
        paymentIntentTtlHours: ttl,
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (e) {
    console.error("PUT /api/admin/payments/settings error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to update settings" }, { status: 500 });
  }
}
