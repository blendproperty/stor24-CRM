import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
export function privacyHash(value: string) {
  return createHash("sha256").update(`${process.env.AUTH_SECRET}:${value}`).digest("hex");
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF guard for mutating requests. Browsers always send an Origin header on
 * same-site fetch/XHR/form submissions for non-safe methods, so a missing
 * Origin on a mutating request is treated as untrusted rather than allowed
 * through. Safe methods (GET/HEAD/OPTIONS) are exempt since they must not
 * have side effects.
 */
export function sameOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin, process.env.APP_URL].filter(Boolean));
  return allowed.has(origin);
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const existing = await db.rateLimitBucket.findUnique({ where: { key } });
  if (!existing || existing.resetAt <= now) {
    await db.rateLimitBucket.upsert({ where: { key }, create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) }, update: { count: 1, resetAt: new Date(now.getTime() + windowMs) } });
    return false;
  }
  if (existing.count >= limit) return true;
  await db.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } });
  return false;
}
