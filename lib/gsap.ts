"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SCROLL_TRIGGER_START } from "@/lib/motion/constants";
import { GSAP_ALLOW_MOTION, GSAP_REDUCE_MOTION } from "@/lib/motion/reduced-motion";

let pluginsRegistered = false;

/**
 * Idempotent ScrollTrigger registration. Safe to call from providers/hooks;
 * no-ops on the server and after the first successful register.
 */
export function ensureGsapPlugins(): void {
  if (pluginsRegistered || typeof window === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
}

ensureGsapPlugins();

export type ScrollTriggerDefaultsOptions = {
  trigger?: Element | string | null;
  start?: string;
  end?: string;
  once?: boolean;
  markers?: boolean;
  toggleActions?: string;
  scrub?: boolean | number;
  pin?: boolean | string | Element;
  invalidateOnRefresh?: boolean;
};

/**
 * Shared ScrollTrigger defaults for enter-viewport reveals.
 *
 * Scrub is opt-in only — pass `scrub` (e.g. `SCROLL_SCRUB_SMOOTH` /
 * `SCROLL_SCRUB_UI` from `@/lib/motion/constants`) for scroll-linked motion.
 * Enter-once reveals stay scrub-free with `toggleActions: "play none none none"`.
 * When `scrub` is set, `toggleActions` is omitted (scrub and toggleActions conflict).
 * Pin is opt-in only (mobile-friendly default: no pin).
 */
export function createScrollTriggerDefaults(
  options: ScrollTriggerDefaultsOptions = {},
): ScrollTrigger.Vars {
  const { scrub, pin, trigger, ...rest } = options;

  return {
    markers: false,
    start: SCROLL_TRIGGER_START,
    toggleActions: scrub === undefined ? "play none none none" : undefined,
    invalidateOnRefresh: true,
    ...rest,
    ...(trigger != null ? { trigger } : {}),
    ...(scrub !== undefined ? { scrub } : {}),
    ...(pin !== undefined ? { pin } : {}),
  };
}

/** Refresh ST after fonts/images/layout settle. Call from providers when useful. */
export function refreshScrollTrigger(): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureGsapPlugins();
  ScrollTrigger.refresh();
}

export {
  gsap,
  ScrollTrigger,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
};
