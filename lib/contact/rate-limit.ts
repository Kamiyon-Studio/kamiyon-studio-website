export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * Simple in-memory sliding-window limiter (per isolate).
 * Enough to blunt casual abuse on Workers Free; not a distributed quota.
 */
export function createContactRateLimiter(options: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();
  const nowFn = options.now ?? Date.now;

  function check(key: string): RateLimitResult {
    const now = nowFn();
    const existing = buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return { allowed: true };
    }

    if (existing.count >= options.limit) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }

    buckets.set(key, {
      count: existing.count + 1,
      resetAt: existing.resetAt,
    });
    return { allowed: true };
  }

  return { check };
}

/** Shared limiter: 5 submissions / IP / 10 minutes. */
export const contactRateLimiter = createContactRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
});
