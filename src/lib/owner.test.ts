import { afterEach, describe, expect, it, vi } from "vitest";
import { makeToken } from "./owner";

afterEach(() => vi.unstubAllGlobals());

describe("makeToken", () => {
  it("works on pages without crypto.randomUUID (plain http network address)", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (a: Uint8Array) => a.fill(171),
    });
    const t = makeToken();
    expect(t).toHaveLength(32);
    expect(t).toMatch(/^[0-9a-f]+$/);
  });

  it("fits what the API accepts (16 to 64 characters)", () => {
    const t = makeToken();
    expect(t.length).toBeGreaterThanOrEqual(16);
    expect(t.length).toBeLessThanOrEqual(64);
  });
});
