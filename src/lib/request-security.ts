import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
export function privacyHash(value: string) {
  return createHash("sha256").update(`${process.env.AUTH_SECRET}:${value}`).digest("hex");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, process.env.APP_URL].filter(Boolean));
  return !origin || allowed.has(origin);
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
