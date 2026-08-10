/**
 * Admin Image Fetch Proxy API
 * GET /api/admin/proxy-image?url=...
 *
 * Server-side image fetch proxy for cross-site drag & drop image uploads.
 * Bypasses client-side browser CORS restrictions safely.
 *
 * Security & Free-Tier Protections:
 * 1. Admin Auth required
 * 2. Protocol & SSRF validation (only http/https; blocks local/private IPs)
 * 3. Max response size (10MB) & 8-second request timeout
 * 4. Cache-Control headers to optimize Vercel function execution bandwidth
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/** Check if hostname is internal or loopback IP (SSRF protection) */
function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 Private & Link-Local Ranges
  if (
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("169.254.") ||
    (host.startsWith("172.") && (() => {
      const parts = host.split(".");
      const second = parseInt(parts[1], 10);
      return second >= 16 && second <= 31;
    })())
  ) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const targetUrl = req.nextUrl.searchParams.get("url");
  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate URL structure & protocol
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http and https URLs are allowed" }, { status: 400 });
  }

  if (isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: "Target host not permitted" }, { status: 400 });
  }

  // Fetch image server-to-server with 8-second timeout & size check
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Remote server responded with status ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (
      !contentType.startsWith("image/") &&
      !contentType.includes("octet-stream") &&
      !contentType.includes("binary")
    ) {
      return NextResponse.json({ error: "Remote resource is not an image" }, { status: 400 });
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image exceeds 10MB limit" }, { status: 400 });
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image exceeds 10MB limit" }, { status: 400 });
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType || "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error && err.name === "AbortError" ? "Fetch timed out" : "Failed to proxy image";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
