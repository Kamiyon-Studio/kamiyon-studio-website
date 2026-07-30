/** Shared motion timing — keep hooks/components aligned. */

export const MOTION_DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  hero: 1.1,
} as const;

export const MOTION_EASE = {
  out: "power2.out",
  inOut: "power2.inOut",
  soft: "power3.out",
} as const;

export const MOTION_DISTANCE = {
  fadeY: 32,
  reveal: 48,
  staggerY: 24,
  parallax: 80,
} as const;

export const MOTION_STAGGER = {
  tight: 0.06,
  base: 0.1,
  loose: 0.16,
} as const;

export const SCROLL_TRIGGER_START = "top 85%";

/** Soft scrub lag for parallax / continuous scroll-linked motion (seconds). */
export const SCROLL_SCRUB_SMOOTH = 0.65;

/** Shorter scrub lag for timeline / compact UI scrubs (seconds). */
export const SCROLL_SCRUB_UI = 0.45;
