import { useSyncExternalStore } from "react";
import { getOwnerToken, OWNER_HEADER } from "./owner";
import { liveOrdersResponseSchema, type LiveOrderRecord } from "./types";

/**
 * Payments saved on the server, shared by every visitor. This keeps one copy in
 * memory, refreshes it every few seconds while a page is using it, and again
 * when the tab comes back into view.
 *
 * The server and the first client render both see an empty list, so hydration
 * matches; the real list arrives a moment later.
 */

const POLL_MS = 8_000;
const EMPTY: readonly LiveOrderRecord[] = [];

interface Snapshot {
  orders: readonly LiveOrderRecord[];
  /** Ids of the payments this browser made */
  mineIds: ReadonlySet<string>;
}

const EMPTY_SNAPSHOT: Snapshot = { orders: EMPTY, mineIds: new Set() };

let snapshot: Snapshot = EMPTY_SNAPSHOT;
let lastJson = "";
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function emit() {
  listeners.forEach((l) => l());
}

/** Fetches the list now. Safe to call often: overlapping calls share one request */
export function refreshLiveOrders(): Promise<void> {
  inFlight ??= (async () => {
    try {
      const res = await fetch("/api/orders", {
        cache: "no-store",
        headers: { [OWNER_HEADER]: getOwnerToken() },
      });
      if (!res.ok) return;
      const parsed = liveOrdersResponseSchema.safeParse(await res.json());
      if (!parsed.success) return;

      // Only tell React when something actually changed
      const json = JSON.stringify(parsed.data.data);
      if (json === lastJson) return;
      lastJson = json;
      snapshot = {
        orders: parsed.data.data,
        mineIds: new Set(
          parsed.data.data.filter((o) => o.mine).map((o) => o.id),
        ),
      };
      emit();
    } catch {
      // Offline or the server is restarting: keep showing the last list
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Removes the payments this browser made, then reloads the list */
export async function deleteMyOrders(): Promise<void> {
  try {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { [OWNER_HEADER]: getOwnerToken() },
    });
  } finally {
    await refreshLiveOrders();
  }
}

function onVisible() {
  if (document.visibilityState === "visible") void refreshLiveOrders();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshLiveOrders();
    timer = setInterval(() => {
      if (document.visibilityState === "visible") void refreshLiveOrders();
    }, POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

export function useLiveOrders(): Snapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY_SNAPSHOT,
  );
}
