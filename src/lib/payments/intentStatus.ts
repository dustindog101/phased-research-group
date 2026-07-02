/**
 * Crypto Payment Gateway — Intent Status helpers
 * Ported from nextjs-boilerplate lib/payments/intentStatus.ts
 */

import type { PaymentIntent } from "./types";

export type EffectiveStatus =
  | "PENDING"
  | "DETECTED"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED";

export function isIntentPastExpiry(intent: Pick<PaymentIntent, "expiresAt">): boolean {
  if (!intent.expiresAt) return false;
  return new Date(intent.expiresAt).getTime() <= Date.now();
}

export function effectiveIntentStatus(intent: Pick<PaymentIntent, "status" | "expiresAt">): EffectiveStatus {
  const status = intent.status as EffectiveStatus;
  if (status === "CANCELLED" || status === "CONFIRMED") return status;
  if (status === "EXPIRED" || isIntentPastExpiry(intent)) return "EXPIRED";
  return status;
}

export function isActivePaymentIntent(
  intent: Pick<PaymentIntent, "status" | "expiresAt"> | null
): boolean {
  if (!intent) return false;
  const status = effectiveIntentStatus(intent);
  return status === "PENDING" || status === "DETECTED";
}

export function intentStatusLabel(status: EffectiveStatus): string {
  const labels: Record<EffectiveStatus, string> = {
    PENDING: "Awaiting Payment",
    DETECTED: "Payment Detected",
    CONFIRMED: "Confirmed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}
