// src/middleware.ts

import {getToken} from "next-auth/jwt";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

/**
 * -------------------
 * Configurable limits
 * -------------------
 */
const MAX_ATTEMPTS = 5; // backoff steps before we enforce a cool-down
const BASE_DELAY_MS = 5_000; // delay grows linearly with attempt count (1x, 2x, ...)
const RATE_LIMIT_WINDOW_MS = 15 * 60_000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100; // sliding window max requests/IP

/**
 * -------------------
 * In-memory stores
 * -------------------
 * Note: Middleware runs on the Edge runtime; these stores are per-instance/region
 * and reset on cold start/redeploy. For production-grade rate limiting,
 * use a shared store (e.g., Redis/Upstash).
 */
const backoff = new Map<string, {count: number; last: number}>();
const ipWindows = new Map<string, number[]>();

/**
 * -------------------
 * Paths
 * -------------------
 */
const PUBLIC_PATHS = ["/login"];
const SKIP_PREFIXES = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * -------------------
 * Trusted IPs (optional)
 * -------------------
 * TRUSTED_IPS: comma-separated exact IPs (e.g. "127.0.0.1,192.168.0.106")
 * HOME_IP_RANGE: prefix match (e.g. "192.168.0")
 */
const TRUSTED = new Set(
  (process.env.TRUSTED_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
const HOME_PREFIX = (process.env.HOME_IP_RANGE || "").trim();

/**
 * Helpers
 */
function isStaticAsset(pathname: string) {
  // Skip common static file extensions
  if (
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff2?|ttf|otf)$/i.test(
      pathname,
    )
  ) {
    return true;
  }
  // Skip known prefixes
  return SKIP_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function getClientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}

function isTrustedIp(ip: string) {
  if (!ip || ip === "unknown") return false;
  if (TRUSTED.has(ip)) return true;
  if (HOME_PREFIX && ip.startsWith(HOME_PREFIX)) return true;
  return false;
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https://lh3.googleusercontent.com; " +
      "font-src 'self' data:;",
  );

  return res;
}

function rateLimitOk(ip: string, now: number) {
  if (!ipWindows.has(ip)) ipWindows.set(ip, []);
  const ts = ipWindows.get(ip)!;

  // drop old timestamps
  while (ts.length && ts[0] <= now - RATE_LIMIT_WINDOW_MS) ts.shift();

  ts.push(now);
  return ts.length <= MAX_REQUESTS_PER_WINDOW;
}

function backoffAllowed(ip: string, now: number) {
  const info = backoff.get(ip) || {count: 0, last: 0};
  if (info.count >= MAX_ATTEMPTS) {
    const delay = BASE_DELAY_MS * info.count;
    if (now - info.last < delay) {
      return false; // still cooling down
    }
    // cooldown passed; reset
    backoff.set(ip, {count: 0, last: 0});
  }
  return true;
}

function registerBackoffStrike(ip: string, now: number) {
  const info = backoff.get(ip) || {count: 0, last: 0};
  backoff.set(ip, {count: info.count + 1, last: now});
}

export async function proxy(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // Skip for static files / api / Next assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Auth (via NextAuth JWT)
  const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

  // Allow the login page when logged out; bounce home if already logged in
  if (isPublicPath(pathname)) {
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Gate all other pages (excluding API because of matcher below)
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // ---- Rate limiting & backoff (skip for trusted IPs) ----
  const ip = getClientIp(req);
  const now = Date.now();

  if (!isTrustedIp(ip)) {
    // Backoff window check first (if they recently hit limits)
    if (!backoffAllowed(ip, now)) {
      const res = new NextResponse("Too many attempts. Try later.", {
        status: 429,
      });
      return applySecurityHeaders(res);
    }

    // Sliding window rate limit
    const ok = rateLimitOk(ip, now);
    if (!ok) {
      registerBackoffStrike(ip, now);
      const res = new NextResponse(
        "Too many requests, please try again later.",
        {status: 429},
      );
      return applySecurityHeaders(res);
    }
  }

  // Success path
  return applySecurityHeaders(NextResponse.next());
}

/**
 * Matcher:
 * - Run on everything except: /api, Next assets, static files, and common meta files.
 * - We DO run on /login so we can allow it for logged-out users and redirect logged-in users away.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff|woff2|ttf|otf)$).*)",
  ],
};
