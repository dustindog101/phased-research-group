/**
 * Security middleware — rate limiting, security headers, bot protection
 * Runs on every request via Next.js middleware
 */

import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per IP + path)
// For production at scale, swap for Upstash Redis (free tier 10k req/day)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute

// Stricter limits for auth and payment endpoints
const STRICT_LIMITS: Record<string, number> = {
  "/api/auth": 10,          // 10 auth attempts/min
  "/api/orders": 20,        // 20 order creations/min
  "/api/payments": 30,      // 30 payment ops/min
};

const DEFAULT_LIMIT = 100; // 100 req/min for general API

function getRateLimit(pathname: string): number {
  for (const [prefix, limit] of Object.entries(STRICT_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return DEFAULT_LIMIT;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; remaining: number } {
  const limit = getRateLimit(pathname);
  const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;
  const now = Date.now();

  const existing = rateLimitMap.get(key);
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  existing.count++;
  if (existing.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - existing.count };
}

// Clean up old entries every 5 minutes to prevent memory leak
let lastCleanup = Date.now();
function cleanupRateLimit() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetTime) rateLimitMap.delete(key);
  }
}

export function proxy(req: NextRequest) {
  cleanupRateLimit();

  const { pathname } = req.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".svg") ||
    pathname.includes(".png") ||
    pathname.includes(".ico") ||
    pathname.includes(".woff")
  ) {
    return NextResponse.next();
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, pathname);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": getRateLimit(pathname).toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", getRateLimit(pathname).toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Content Security Policy — allows inline styles (Tailwind), self for scripts, Google Fonts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.coingecko.com https://api.etherscan.io https://blockstream.info https://litecoinspace.org https://base.blockscout.com https://optimism.blockscout.com https://api.mainnet-beta.solana.com https://mainnet.helius-rpc.com https://api.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  // Permissions Policy (disable camera, mic, geolocation)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  );

  // Strict Transport Security (force HTTPS) — only in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
