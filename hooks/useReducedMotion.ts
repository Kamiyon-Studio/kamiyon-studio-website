"use client";

import { useSyncExternalStore } from "react";

import {
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
} from "@/lib/motion/reduced-motion";

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

/** Server and hydration snapshot: the server has no media queries to read. */
function motionAllowed(): boolean {
  return false;
}

/**
 * Reduced-motion preference safe to read *during render*.
 *
 * Returns false on the server and for the hydration pass so both renders agree,
 * then re-renders with the real preference. Calling `prefersReducedMotion()`
 * straight from a render body instead produces a hydration mismatch, which makes
 * React throw away and rebuild the whole tree.
 *
 * Inside effects and event handlers, call `prefersReducedMotion()` directly —
 * those run client-only, so there is nothing to mismatch.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    motionAllowed,
  );
}
