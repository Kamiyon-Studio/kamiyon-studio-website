import { describe, expect, it } from "vitest";

import { createContactRateLimiter } from "./rate-limit";

describe("createContactRateLimiter", () => {
  it("allows requests under the limit and blocks after", () => {
    const limiter = createContactRateLimiter({
      limit: 2,
      windowMs: 60_000,
      now: () => 1_000,
    });

    expect(limiter.check("1.1.1.1").allowed).toBe(true);
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
    expect(limiter.check("1.1.1.1")).toEqual({
      allowed: false,
      retryAfterSec: 60,
    });
    expect(limiter.check("2.2.2.2").allowed).toBe(true);
  });

  it("resets after the window elapses", () => {
    let now = 0;
    const limiter = createContactRateLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => now,
    });

    expect(limiter.check("1.1.1.1").allowed).toBe(true);
    expect(limiter.check("1.1.1.1").allowed).toBe(false);
    now = 1_001;
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
  });
});

it("bounds unique clients without evicting active limits and frees expired slots", () => {
  let now = 0;
  const limiter = createContactRateLimiter({ limit: 1, windowMs: 1000, maxBuckets: 2, now: () => now });
  expect(limiter.check("a").allowed).toBe(true);
  expect(limiter.check("b").allowed).toBe(true);
  expect(limiter.check("c").allowed).toBe(false);
  expect(limiter.check("a").allowed).toBe(false);
  now = 1001;
  expect(limiter.check("c").allowed).toBe(true);
});
