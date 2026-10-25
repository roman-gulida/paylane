/**
 * A random token this browser makes for itself, sent with each payment so the
 * server can tell which payments are yours (it stores only a hash). It lets
 * "Reset demo" remove your payments without touching anyone else's.
 *
 * Browser only. Call it from event handlers and effects, never while rendering.
 */

const KEY = "paylane:owner:v1";
let cached: string | null = null;

/**
 * crypto.randomUUID() only exists on secure pages (https or localhost). Opened
 * through a network address such as http://172.xx.x.x:3000 it is undefined, so
 * fall back to getRandomValues, which works everywhere.
 */
export function makeToken(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getOwnerToken(): string {
  if (cached) return cached;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved.length >= 16 && saved.length <= 64) {
      cached = saved;
      return saved;
    }
  } catch {
    // Storage blocked: use a token that lasts until the tab closes
  }
  const token = makeToken();
  cached = token;
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // Same: the in-memory token still works
  }
  return token;
}

export const OWNER_HEADER = "x-paylane-owner";
