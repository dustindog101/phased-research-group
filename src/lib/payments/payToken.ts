/**
 * HMAC Pay Tokens — guest / unauthenticated crypto invoice access
 * Ported from nextjs-boilerplate lib/payToken.ts + Python pay_token.py
 *
 * Guests who don't have a login JWT can still pay a crypto invoice via
 * a short-lived HMAC token bound to their orderId. Minted by
 * /api/payments/pay-session, verified on every /api/orders/track call
 * that includes a payToken.
 */

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TYP = "pay";
const DEFAULT_TTL_SECONDS = 48 * 60 * 60; // 48 hours

function b64urlEncode(data: Buffer): string {
  return data.toString("base64url");
}

function b64urlDecode(data: string): Buffer {
  return Buffer.from(data, "base64url");
}

export function signPayToken(
  orderId: string,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = JSON.stringify({ typ: TOKEN_TYP, orderId, exp });
  const payloadB64 = b64urlEncode(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", secret).update(payloadB64).digest();
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export function verifyPayToken(
  token: string,
  secret: string,
  expectedOrderId: string
): { orderId: string; exp: number } | null {
  if (!secret || !token || !expectedOrderId) return null;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  const expectedSig = createHmac("sha256", secret).update(payloadB64).digest();
  const expectedSigB64 = b64urlEncode(expectedSig);

  // Timing-safe comparison
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSigB64);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));
    if (payload.typ !== TOKEN_TYP) return null;
    if (payload.orderId !== expectedOrderId) return null;
    if (typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { orderId: payload.orderId, exp: payload.exp };
  } catch {
    return null;
  }
}

export function getPayTokenSecret(): string {
  const secret = process.env.PAY_TOKEN_SECRET;
  if (!secret) {
    throw new Error("PAY_TOKEN_SECRET is not set. Cannot sign pay tokens.");
  }
  return secret;
}
