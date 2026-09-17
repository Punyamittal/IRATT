import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 15 * 60 * 1000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 2000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.slice(0, 64) || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs = WINDOW_MS) {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "TOO MANY REQUESTS — Wait and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function sameOrigin(request: Request) {
  const host = request.headers.get("host");
  if (!host) return false;
  const origin = request.headers.get("origin");
  const proto = request.headers.get("x-forwarded-proto") || (origin?.startsWith("https") ? "https" : "http");
  const expected = `${proto}://${host}`;
  if (origin) {
    return origin === expected || origin === `https://${host}` || origin === `http://${host}`;
  }
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return url.host === host;
  } catch {
    return false;
  }
}

export function rejectCrossOrigin() {
  return NextResponse.json({ error: "REQUEST BLOCKED." }, { status: 403, headers: { "Cache-Control": "no-store" } });
}

export function applySecurityHeaders(response: NextResponse, pathname?: string) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (pathname?.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export function noStore(init?: ResponseInit): ResponseInit {
  return {
    ...init,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      ...(init?.headers ?? {}),
    },
  };
}

export function sanitizeSpreadsheetCell(value: string) {
  const trimmed = value ?? "";
  const safe = /^[=+\-@|]/.test(trimmed) ? `'${trimmed}` : trimmed;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function isSafeAdminPath(path: string) {
  return path.startsWith("/admin") && !path.startsWith("//") && !path.includes("\\");
}
