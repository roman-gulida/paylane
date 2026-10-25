/**
 * A small fixed-window rate limiter, kept in memory.
 *
 * Enough to stop one visitor from filling a public demo with payments. It
 * resets when the server restarts and is per instance, which is fine for a
 * single container. Use Redis or a gateway if this ever runs on several.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateResult {
  // Forget expired windows now and then so the map cannot grow forever
  if (buckets.size > 2_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  return {
    ok: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** The caller's address as seen behind a proxy (Render, Fly, nginx) */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("fly-client-ip") ||
    "unknown"
  );
}

/** Test helper */
export function resetRateLimits() {
  buckets.clear();
}
