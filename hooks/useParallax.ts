"use client";

import { useRef, type RefObject } from "react";

import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import {
  MOTION_DISTANCE,
  SCROLL_SCRUB_SMOOTH,
} from "@/lib/motion/constants";
import type { MotionElementRef, ParallaxOptions } from "@/lib/motion/types";

import { useGsapContext } from "./useGsapContext";

const defaults: Required<
  Pick<ParallaxOptions, "speed" | "disabled" | "scrub">
> = {
  speed: MOTION_DISTANCE.parallax,
  disabled: false,
  scrub: SCROLL_SCRUB_SMOOTH,
};

export function useParallax<T extends HTMLElement = HTMLElement>(
  options: ParallaxOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const merged = { ...defaults, ...options };

  useGsapContext(
    ref as MotionElementRef,
    () => {
      const el = ref.current;
      if (!el || merged.disabled) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(el, { y: 0 });
      });

      // Skip scrubbed parallax on coarse pointers (touch) — less vestibular load.
      mm.add(
        `${GSAP_ALLOW_MOTION} and (pointer: fine)`,
        () => {
          gsap.fromTo(
            el,
            { y: -merged.speed / 2 },
            {
              y: merged.speed / 2,
              ease: "none",
              scrollTrigger: createScrollTriggerDefaults({
                trigger: merged.trigger ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: merged.scrub,
              }),
            },
          );
        },
      );
    },
    [merged.speed, merged.disabled, merged.scrub, merged.trigger],
  );

  return ref;
}
