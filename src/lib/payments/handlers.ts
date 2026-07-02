/**
 * Crypto Payment Gateway — Intent Handlers
 * Ported from Python handlers.py (LOOKUP Lambda)
 *
 * All DynamoDB operations replaced with Prisma queries.
 * Business logic (unique amount, collision retry, ownership checks) preserved 1:1.
 */

import { db } from "@/db";
import { ASSETS, isCryptoPaymentsEnabled, type CryptoAssetId } from "./constants";
import { computeUniqueAmount, fetchCoinGeckoRates } from "./amounts";
import {
  computeExpiresAt,
  getSettings,
  isGatewayEnabled,
  sanitizeIntentForClient,
} from "./settings";
import { validateAddress } from "./validation";
import type { PaymentIntent } from "./types";

const ACTIVE_STATUSES = ["PENDING", "DETECTED"] as const;

function requireGateway(): void {
  if (!isCryptoPaymentsEnabled()) {
    throw new Error("Crypto payments are not enabled on this deployment.");
  }
}

async function getActiveIntentForOrder(orderId: string) {
  return db.paymentIntent.findFirst({
    where: {
      orderId,
      status: { in: [...ACTIVE_STATUSES] },
    },
  });
}

export async function handleListCryptoMethods() {
  if (!isCryptoPaymentsEnabled()) {
    return { methods: [], enabled: false };
  }
  const settings = await getSettings();
  const methods = settings.paymentGateways
    ? Object.entries(settings.paymentGateways)
        .filter(([_, cfg]) => cfg.enabled && cfg.address)
        .map(([id]) => {
          const meta = ASSETS[id as CryptoAssetId];
          return {
            id: id as CryptoAssetId,
            label: meta.label,
            icon: meta.icon,
            symbol: meta.symbol,
          };
        })
    : [];
  return { methods, enabled: methods.length > 0 };
}

export interface CreateIntentContext {
  userId?: string | null;
  isAdmin?: boolean;
  payToken?: string | null;
}

export async function handleCreatePaymentIntent(
  orderId: string,
  asset: CryptoAssetId,
  ctx: CreateIntentContext
) {
  requireGateway();
  if (!orderId || !asset) {
    throw new Error("Missing 'orderId' or 'asset'.");
  }
  if (!(asset in ASSETS)) {
    throw new Error(`Unknown asset: ${asset}.`);
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);

  // Ownership check — admin can create for any user; otherwise user must own it
  if (!ctx.isAdmin && order.userId && order.userId !== ctx.userId) {
    throw new Error("Access denied.");
  }
  if (order.paymentStatus === "PAID") {
    throw new Error("Order is already paid.");
  }

  const existing = await getActiveIntentForOrder(orderId);
  if (existing) {
    throw new Error("An active payment invoice already exists. Cancel it before creating a new one.");
  }

  const settings = await getSettings();
  const gw = settings.paymentGateways[asset];
  if (!gw?.enabled || !gw?.address) {
    throw new Error(`Payment method ${asset} is not enabled.`);
  }

  const depositAddress = gw.address.trim();
  if (!validateAddress(asset, depositAddress)) {
    throw new Error("Configured deposit address is invalid.");
  }

  const usdTotal = order.total;
  const rates = await fetchCoinGeckoRates();
  const ttlHours = settings.paymentIntentTtlHours;
  const expiresAt = computeExpiresAt(ttlHours, order.paymentExpiresAt);

  // Collision-retry loop (max 5 attempts)
  for (let attempt = 0; attempt < 5; attempt++) {
    const amountData = computeUniqueAmount(asset, usdTotal, rates);

    // Check for collision: another active intent with same depositAddress + expectedAtomic
    const collision = await db.paymentIntent.findFirst({
      where: {
        depositAddress,
        expectedAtomic: amountData.expectedAtomic,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { id: true },
    });
    if (collision) continue;

    try {
      const intent = await db.paymentIntent.create({
        data: {
          orderId,
          userId: order.userId,
          asset,
          depositAddress,
          expectedAmount: amountData.expectedAmount,
          expectedAtomic: amountData.expectedAtomic,
          uniqueSuffix: amountData.uniqueSuffix,
          baseTotalUsd: amountData.baseTotalUsd,
          exchangeRate: amountData.exchangeRate,
          status: "PENDING",
          confirmations: 0,
          expiresAt,
        },
      });

      await db.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: intent.id,
          cryptoAsset: asset,
          updatedAt: new Date(),
        },
      });

      return sanitizeIntentForClient(intent);
    } catch (e: unknown) {
      // Unique constraint violation — retry with new UUID
      if (e && typeof e === "object" && "code" in e && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new Error("Could not create payment invoice; try again.");
}

export async function handleGetPaymentIntent(
  orderId: string,
  ctx: CreateIntentContext
) {
  requireGateway();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);

  // Guest with payToken can view; otherwise must own
  if (!ctx.payToken && !ctx.isAdmin && order.userId && order.userId !== ctx.userId) {
    throw new Error("Access denied.");
  }

  if (!order.paymentIntentId) {
    return { intent: null };
  }
  const intent = await db.paymentIntent.findUnique({
    where: { id: order.paymentIntentId },
  });
  if (!intent) return { intent: null };
  return { intent: sanitizeIntentForClient(intent) };
}

export async function handleCancelPaymentIntent(
  orderId: string,
  ctx: CreateIntentContext
) {
  requireGateway();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);

  if (!ctx.payToken && !ctx.isAdmin && order.userId && order.userId !== ctx.userId) {
    throw new Error("Access denied.");
  }

  const intent = await getActiveIntentForOrder(orderId);
  if (!intent) {
    return { message: "No active payment invoice to cancel." };
  }

  const now = new Date();
  await db.paymentIntent.update({
    where: { id: intent.id },
    data: { status: "CANCELLED", cancelledAt: now },
  });

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentIntentId: null,
      cryptoAsset: null,
      updatedAt: now,
    },
  });

  return { message: "Payment invoice cancelled.", intentId: intent.id };
}

// ============ Admin-only handlers ============

export async function handleAdminGetPaymentIntent(orderId: string) {
  requireGateway();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);

  if (!order.paymentIntentId) {
    const active = await getActiveIntentForOrder(orderId);
    if (active) return { intent: sanitizeIntentForClient(active) };
    return { intent: null };
  }

  const intent = await db.paymentIntent.findUnique({
    where: { id: order.paymentIntentId },
  });
  if (!intent) return { intent: null };
  return { intent: sanitizeIntentForClient(intent) };
}

export async function handleAdminCancelPaymentIntent(orderId: string) {
  requireGateway();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);

  let intent = await getActiveIntentForOrder(orderId);
  if (!intent && order.paymentIntentId) {
    const found = await db.paymentIntent.findUnique({
      where: { id: order.paymentIntentId },
    });
    if (found && ACTIVE_STATUSES.includes(found.status as typeof ACTIVE_STATUSES[number])) {
      intent = found;
    }
  }
  if (!intent) {
    return { message: "No active payment invoice to cancel." };
  }

  const now = new Date();
  await db.paymentIntent.update({
    where: { id: intent.id },
    data: { status: "CANCELLED", cancelledAt: now },
  });
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentIntentId: null,
      cryptoAsset: null,
      updatedAt: now,
    },
  });

  return { message: "Payment invoice cancelled.", intentId: intent.id };
}

export async function handleAdminCreatePaymentIntent(
  orderId: string,
  asset: CryptoAssetId
) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order '${orderId}' not found.`);
  if (!order.userId) throw new Error("Order has no userId.");
  const intent = await handleCreatePaymentIntent(orderId, asset, {
    userId: order.userId,
    isAdmin: true,
  });
  return { intent };
}
