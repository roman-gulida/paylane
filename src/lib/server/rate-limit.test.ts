import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, rateLimit, resetRateLimits } from "./rate-limit";

beforeEach(() => resetRateLimits());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks until the window ends", () => {
    for (let i = 0; i < 3; i++)
      expect(rateLimit("a", 3, 1000, 0).ok).toBe(true);
    const blocked = rateLimit("a", 3, 1000, 100);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(rateLimit("a", 3, 1000, 1000).ok).toBe(true);
  });

  it("counts each key separately", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("a", 1, 1000, 1).ok).toBe(false);
    expect(rateLimit("b", 1, 1000, 1).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    const r = new Request("http://x", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(clientKey(r)).toBe("203.0.113.5");
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
