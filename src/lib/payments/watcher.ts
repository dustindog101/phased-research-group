/**
 * Crypto Payment Gateway — Payment Watcher
 * Ported from Python lambda_function.py (payment_watcher Lambda)
 *
 * Original ran on AWS EventBridge rate(2 minutes). Here we run it via:
 *   1. Vercel Cron daily (expire stale intents + reconcile missed payments)
 *   2. Client-side polling (real-time detection while modal is open)
 *
 * Core matching logic (exact atomic amount, no partial credit) preserved 1:1.
 */

import { db } from "@/db";
import { ASSETS, isCryptoPaymentsEnabled, type CryptoAssetId } from "./constants";
import { getSettings, isGatewayEnabled } from "./settings";
import { fetchInboundTransfers } from "./adapters/esplora";
import { fetchUsdcTransfers } from "./adapters/etherscan";
import { fetchSolTransfers, fetchUsdcSplTransfers } from "./adapters/solana";
import { sendPaymentReceived } from "@/lib/email";

const ACTIVE = ["PENDING", "DETECTED"] as const;

interface ChainTransfer {
  txHash: string;
  amountAtomic: string;
  confirmations: number;
  timestamp: number | null;
}

async function fetchTransfers(
  asset: CryptoAssetId,
  depositAddress: string
): Promise<ChainTransfer[]> {
  const meta = ASSETS[asset];
  if (meta.family === "esplora" && meta.esploraBase) {
    return fetchInboundTransfers(meta.esploraBase, depositAddress);
  }
  if (meta.family === "etherscan" && meta.chainId && meta.contract) {
    return fetchUsdcTransfers(meta.chainId, meta.contract, depositAddress);
  }
  if (meta.family === "solana") {
    return fetchSolTransfers(depositAddress);
  }
  if (meta.family === "solana_usdc") {
    return fetchUsdcSplTransfers(depositAddress);
  }
  return [];
}

/**
 * Expire stale intents (status PENDING/DETECTED past expiresAt).
 * Clears paymentIntentId + cryptoAsset on the order so a new invoice can be created.
 */
export async function expireStaleIntents(): Promise<number> {
  const now = new Date();
  const stale = await db.paymentIntent.findMany({
    where: {
      status: { in: [...ACTIVE] },
      expiresAt: { lt: now },
    },
    select: { id: true, orderId: true },
  });

  for (const intent of stale) {
    await db.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "EXPIRED" },
    });
    if (intent.orderId) {
      await db.order.update({
        where: { id: intent.orderId },
        data: { paymentIntentId: null, cryptoAsset: null, updatedAt: now },
      });
    }
  }
  return stale.length;
}

/**
 * Process one intent against fetched transfers.
 * Matches on exact atomic amount. Transitions:
 *   PENDING → DETECTED (tx seen, below min confirmations)
 *   DETECTED → CONFIRMED (tx seen, at/above min confirmations; order marked PAID)
 */
async function processIntent(
  intent: {
    id: string;
    orderId: string;
    expectedAtomic: string;
    txHash: string | null;
    status: string;
  },
  transfers: ChainTransfer[],
  minConf: number
): Promise<boolean> {
  const matched = transfers.find((t) => String(t.amountAtomic) === String(intent.expectedAtomic));
  if (!matched) return false;

  const txHash = matched.txHash;
  const conf = matched.confirmations;
  // If already has a different txHash, skip (shouldn't happen, but safety)
  if (intent.txHash && intent.txHash !== txHash) return false;

  if (conf >= minConf) {
    const now = new Date();
    await db.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "CONFIRMED",
        txHash,
        confirmations: conf,
        confirmedAt: now,
      },
    });
    await db.order.update({
      where: { id: intent.orderId },
      data: {
        paymentStatus: "PAID",
        status: "PAID",
        cryptoTxHash: txHash,
        updatedAt: now,
      },
    });

    // Deduct inventory + send payment confirmation email (non-blocking)
    try {
      const order = await db.order.findUnique({
        where: { id: intent.orderId },
        include: { items: true, user: true },
      });
      if (order) {
        // Deduct inventory for each item
        for (const item of order.items) {
          const deductQty = item.isKit ? item.quantity * 5 : item.quantity;
          await db.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: deductQty } },
          });
        }

        // Send payment confirmation email
        const customerEmail = order.user?.email ?? order.guestEmail;
        if (customerEmail) {
          const assetMeta = ASSETS[intent.asset as CryptoAssetId];
          sendPaymentReceived({
            to: customerEmail,
            orderNumber: order.orderNumber,
            orderId: order.id,
            asset: assetMeta?.label ?? intent.asset,
            amount: "confirmed",
            total: order.total,
          }).catch((e) => console.error("Payment email failed:", e));
        }
      }
    } catch (e) {
      console.error("Post-confirmation processing error:", e);
    }
    return true;
  } else if (intent.status === "PENDING") {
    await db.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "DETECTED",
        txHash,
        confirmations: conf,
      },
    });
    return true;
  }
  return false;
}

export interface WatchResult {
  skipped?: boolean;
  reason?: string;
  processed?: number;
  groups?: number;
  enabledAssets?: number;
  expiredSweep?: number;
}

/**
 * Main watcher entry point.
 * Called by:
 *   - Vercel Cron (/api/cron/payment-watcher) daily
 *   - Client-side poll (/api/payments/poll?orderId=X) for real-time modal UX
 */
export async function runWatcher(): Promise<WatchResult> {
  if (!isCryptoPaymentsEnabled()) {
    return { skipped: true, reason: "CRYPTO_PAYMENTS_ENABLED=false" };
  }

  const now = new Date();
  const expiredCount = await expireStaleIntents();

  const settings = await getSettings();
  const enabledAssets = new Set(
    Object.keys(ASSETS).filter((id) =>
      isGatewayEnabled(settings, id as CryptoAssetId)
    )
  );
  if (enabledAssets.size === 0) {
    return {
      skipped: true,
      reason: "no_enabled_crypto_gateways",
      expiredSweep: expiredCount,
    };
  }

  // Fetch all active, non-expired intents
  const pendingIntents = await db.paymentIntent.findMany({
    where: {
      status: { in: [...ACTIVE] },
      expiresAt: { gte: now },
    },
  });

  // Filter to enabled assets only
  const watchable = pendingIntents.filter((i) => enabledAssets.has(i.asset as CryptoAssetId));
  if (watchable.length === 0) {
    return {
      processed: 0,
      groups: 0,
      enabledAssets: enabledAssets.size,
      expiredSweep: expiredCount,
    };
  }

  // Group by (asset, depositAddress) — one adapter call per group
  const groups = new Map<string, typeof watchable>();
  for (const intent of watchable) {
    const key = `${intent.asset}:${intent.depositAddress}`;
    const arr = groups.get(key) ?? [];
    arr.push(intent);
    groups.set(key, arr);
  }

  let processed = 0;
  for (const [key, intents] of groups) {
    const [assetId, deposit] = key.split(":");
    const asset = assetId as CryptoAssetId;
    if (!enabledAssets.has(asset)) continue;

    let transfers: ChainTransfer[] = [];
    try {
      transfers = await fetchTransfers(asset, deposit);
    } catch (e) {
      console.error(`Adapter error ${asset} ${deposit}:`, e);
      continue;
    }

    const gw = settings.paymentGateways[asset];
    const minConf = gw?.minConfirmations ?? ASSETS[asset].defaultConfirmations;

    for (const intent of intents) {
      try {
        const did = await processIntent(intent, transfers, minConf);
        if (did) processed++;
      } catch (e) {
        console.error(`Intent error ${intent.id}:`, e);
      }
    }
  }

  return {
    processed,
    groups: groups.size,
    enabledAssets: enabledAssets.size,
    expiredSweep: expiredCount,
  };
}

/**
 * Watch a single order's intent (used by client-side polling).
 * Returns the current intent status so the modal can update.
 */
export async function watchSingleOrder(orderId: string): Promise<{
  watched: boolean;
  status?: string;
  reason?: string;
}> {
  if (!isCryptoPaymentsEnabled()) {
    return { watched: false, reason: "CRYPTO_PAYMENTS_ENABLED=false" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentIntentId: true, paymentStatus: true },
  });
  if (!order) return { watched: false, reason: "order_not_found" };
  if (order.paymentStatus === "PAID") return { watched: false, reason: "already_paid" };
  if (!order.paymentIntentId) return { watched: false, reason: "no_intent" };

  const intent = await db.paymentIntent.findUnique({
    where: { id: order.paymentIntentId },
  });
  if (!intent) return { watched: false, reason: "intent_not_found" };
  if (!ACTIVE.includes(intent.status as typeof ACTIVE[number])) {
    return { watched: false, reason: `intent_${intent.status.toLowerCase()}` };
  }

  const settings = await getSettings();
  if (!isGatewayEnabled(settings, intent.asset as CryptoAssetId)) {
    return { watched: false, reason: "gateway_disabled" };
  }

  let transfers: ChainTransfer[] = [];
  try {
    transfers = await fetchTransfers(
      intent.asset as CryptoAssetId,
      intent.depositAddress
    );
  } catch (e) {
    console.error(`Poll adapter error ${intent.asset}:`, e);
    return { watched: false, reason: "adapter_error" };
  }

  const gw = settings.paymentGateways[intent.asset as CryptoAssetId];
  const minConf = gw?.minConfirmations ?? ASSETS[intent.asset as CryptoAssetId].defaultConfirmations;

  await processIntent(
    {
      id: intent.id,
      orderId: intent.orderId,
      expectedAtomic: intent.expectedAtomic,
      txHash: intent.txHash,
      status: intent.status,
    },
    transfers,
    minConf
  );

  const updated = await db.paymentIntent.findUnique({
    where: { id: intent.id },
    select: { status: true },
  });
  return { watched: true, status: updated?.status };
}
