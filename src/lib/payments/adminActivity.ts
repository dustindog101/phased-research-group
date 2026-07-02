/**
 * Crypto Payment Gateway — Admin Activity Handlers
 * Ported from Python admin_activity.py
 *
 * Lists payment intents with filters, summary counts for the admin dashboard.
 */

import { db } from "@/db";
import { listEnabledAssetIds } from "./settings";
import { sanitizeIntentForClient } from "./settings";
import { getSettings } from "./settings";
import type { PaymentActivityItem } from "./types";

const ALL_STATUSES = ["PENDING", "DETECTED", "CONFIRMED", "EXPIRED", "CANCELLED"] as const;
const ACTIVE_STATUSES = ["PENDING", "DETECTED"] as const;

function statusesForFilter(filter?: string | null): readonly string[] {
  if (!filter || filter === "all") return ALL_STATUSES;
  if (filter === "active") return ACTIVE_STATUSES;
  if (ALL_STATUSES.includes(filter as typeof ALL_STATUSES[number])) return [filter];
  throw new Error(`Invalid status filter: '${filter}'.`);
}

export async function handleGetPaymentActivitySummary() {
  const settings = await getSettings();
  const enabledAssets = listEnabledAssetIds(settings);

  const [pending, detected, confirmed, expired, cancelled] = await Promise.all([
    db.paymentIntent.count({ where: { status: "PENDING" } }),
    db.paymentIntent.count({ where: { status: "DETECTED" } }),
    db.paymentIntent.count({ where: { status: "CONFIRMED" } }),
    db.paymentIntent.count({ where: { status: "EXPIRED" } }),
    db.paymentIntent.count({ where: { status: "CANCELLED" } }),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const confirmedLast7Days = await db.paymentIntent.count({
    where: {
      status: "CONFIRMED",
      confirmedAt: { gte: sevenDaysAgo },
    },
  });

  return {
    active: pending + detected,
    pending,
    detected,
    confirmed,
    confirmedLast7Days,
    expired,
    cancelled,
    enabledCryptoAssets: enabledAssets.length,
  };
}

export async function handleListPaymentIntents(params: {
  status?: string;
  asset?: string;
  search?: string;
  limit?: number;
}): Promise<{ intents: PaymentActivityItem[]; count: number }> {
  const statusFilter = params.status ?? "all";
  const assetFilter = params.asset?.trim() || undefined;
  const search = params.search?.trim() || "";
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

  const statuses = statusesForFilter(statusFilter);

  const where: Record<string, unknown> = {
    status: { in: [...statuses] },
  };
  if (assetFilter) where.asset = assetFilter;

  // Search filter applied in-memory after fetch (matches Python approach)
  const rawItems = await db.paymentIntent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit * 2, // fetch extra to allow for search filtering
  });

  // Batch fetch orders
  const orderIds = [...new Set(rawItems.map((i) => i.orderId))];
  const orders = await db.order.findMany({
    where: { id: { in: orderIds } },
    select: {
      id: true,
      userId: true,
      source: true,
      paymentStatus: true,
      paymentMethod: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });
  const ordersMap = new Map(orders.map((o) => [o.id, o]));

  const enriched: PaymentActivityItem[] = [];
  for (const item of rawItems) {
    const order = ordersMap.get(item.orderId);
    if (search) {
      const q = search.toLowerCase();
      const matches =
        item.orderId.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.txHash ?? "").toLowerCase().includes(q) ||
        (order?.userId ?? "").toLowerCase().includes(q);
      if (!matches) continue;
    }
    const sanitized = sanitizeIntentForClient(item);
    enriched.push({
      ...sanitized,
      rail: "crypto",
      order: order
        ? {
            orderId: order.id,
            userId: order.userId,
            source: order.source,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            status: order.status,
            orderTotal: order.total,
            createdAt: order.createdAt,
          }
        : null,
    } as PaymentActivityItem);
    if (enriched.length >= limit) break;
  }

  return { intents: enriched, count: enriched.length };
}
