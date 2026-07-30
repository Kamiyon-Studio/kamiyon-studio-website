"use client";

import { useRef, type RefObject } from "react";

import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import type { MotionElementRef } from "@/lib/motion/types";

import { useGsapContext } from "./useGsapContext";

export type ParallaxLayerMotion = {
  /** Value of the `data-parallax-layer` attribute to drive. */
  layer: string;
  /** Travel as a percentage of the layer's own height. */
  yPercent: number;
};

export type LayeredParallaxOptions = {
  disabled?: boolean;
};

/**
 * Scrubs `[data-parallax-layer]` descendants apart while the scope element
 * scrolls out of view.
 *
 * Scrolling already moves every layer up by the scroll distance, so pushing a
 * layer *down* cancels part of that: the larger the yPercent, the less the layer
 * appears to move, which is what reads as depth. All layers animate on the same
 * timeline position so they stay locked to scroll progress rather than
 * sequencing one after another.
 *
 * Matches the rest of the GSAP stack: native document scroll, no smooth-scroll
 * library, and scrubbed motion only on fine pointers.
 */
export function useLayeredParallax<T extends HTMLElement = HTMLElement>(
  layers: readonly ParallaxLayerMotion[],
  options: LayeredParallaxOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const disabled = options.disabled ?? false;
  // Layer arrays are rebuilt on every render; compare by value, not identity.
  const signature = layers
    .map(({ layer, yPercent }) => `${layer}:${yPercent}`)
    .join(",");

  useGsapContext(
    ref as MotionElementRef,
    () => {
      const root = ref.current;
      if (!root || disabled) {
        return;
      }

      const selectLayer = (layer: string): HTMLElement[] =>
        Array.from(
          root.querySelectorAll<HTMLElement>(`[data-parallax-layer="${layer}"]`),
        );

      const targets = layers.map(({ layer, yPercent }) => ({
        yPercent,
        nodes: selectLayer(layer),
      }));

      const allNodes = targets.flatMap(({ nodes }) => nodes);
      if (allNodes.length === 0) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(allNodes, { yPercent: 0, clearProps: "transform" });
      });

      // Skip scrubbed parallax on coarse pointers (touch) — less vestibular load.
      mm.add(`${GSAP_ALLOW_MOTION} and (pointer: fine)`, () => {
        const timeline = gsap.timeline({
          scrollTrigger: createScrollTriggerDefaults({
            trigger: root,
            start: "0% 0%",
            end: "100% 0%",
            scrub: 0,
          }),
        });

        targets.forEach(({ nodes, yPercent }, index) => {
          if (nodes.length === 0) {
            return;
          }

          timeline.to(
            nodes,
            { yPercent, ease: "none" },
            index === 0 ? undefined : "<",
          );
        });
      });
    },
    [signature, disabled],
  );

  return ref;
}
