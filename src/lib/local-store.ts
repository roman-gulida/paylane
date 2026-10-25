import { useSyncExternalStore } from "react";
import type { z } from "zod";

/**
 * A tiny browser-storage store for one validated value, shared by the saved
 * payments and the settlement wallet.
 *
 * - Reads are validated with Zod, so stale or edited storage can't crash the UI.
 * - If storage is blocked (private mode, quota), the value still works in memory
 *   until the tab closes.
 * - The server and the first client render both see `empty`, so hydration matches.
 * - Other tabs stay in sync through the `storage` event.
 */
export function createLocalStore<T>(
  key: string,
  schema: z.ZodType<T>,
  empty: T,
) {
  const listeners = new Set<() => void>();
  let snapshot = empty;
  let loaded = false;

  function load() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        snapshot = empty;
        return;
      }
      const parsed = schema.safeParse(JSON.parse(raw));
      snapshot = parsed.success ? parsed.data : empty;
    } catch {
      // Blocked storage or corrupt JSON: keep whatever is in memory
    }
  }

  function ensureLoaded() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    load();
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function get(): T {
    ensureLoaded();
    return snapshot;
  }

  function set(next: T) {
    ensureLoaded();
    snapshot = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Keep the in-memory value
    }
    emit();
  }

  function clear() {
    snapshot = empty;
    try {
      localStorage.removeItem(key);
    } catch {
      // Keep the in-memory value
    }
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        load();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => empty);
  }

  return { get, set, clear, useValue };
}
