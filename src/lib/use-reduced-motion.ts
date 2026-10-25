import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True when the visitor asked the OS to reduce motion.
 *
 * Hydration-safe: the server and the first client render both return `false`,
 * then React re-renders with the real value. Branching on the real value during
 * the first render (what framer-motion's own hook allows) makes the server HTML
 * and the client disagree, which throws a hydration error.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
