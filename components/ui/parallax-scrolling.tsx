"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef, type JSX } from "react";

import { useGsapContext } from "@/hooks/useGsapContext";
import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import { cn } from "@/lib/utils";

import "./parallax-scrolling.css";

export type ParallaxScrollingProps = {
  title?: string;
  className?: string;
  showContentMark?: boolean;
};

const LAYER_Y_PERCENTS = [
  { layer: "1", yPercent: 70 },
  { layer: "2", yPercent: 55 },
  { layer: "3", yPercent: 40 },
  { layer: "4", yPercent: 10 },
] as const;

const LAYER_IMAGES = {
  back: "/assets/background.png",
  mid: "/assets/youtube-banner.png",
  front: "/assets/kami-chan-concept-art.png",
} as const;

/**
 * Osmo-style multilayer parallax demo.
 * Uses native scroll + ScrollTrigger via site GSAP stack (no Lenis).
 */
export function ParallaxScrolling({
  title = "Parallax",
  className,
  showContentMark = true,
}: ParallaxScrollingProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    rootRef,
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const triggerElement = root.querySelector<HTMLElement>(
        "[data-parallax-layers]",
      );
      if (!triggerElement) {
        return;
      }

      const layerNodes = LAYER_Y_PERCENTS.flatMap(({ layer }) =>
        Array.from(
          triggerElement.querySelectorAll<HTMLElement>(
            `[data-parallax-layer="${layer}"]`,
          ),
        ),
      );

      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(layerNodes, { yPercent: 0, clearProps: "transform" });
      });

      // Skip scrubbed parallax on coarse pointers (touch) — same as useParallax.
      mm.add(`${GSAP_ALLOW_MOTION} and (pointer: fine)`, () => {
        const tl = gsap.timeline({
          scrollTrigger: createScrollTriggerDefaults({
            trigger: triggerElement,
            start: "0% 0%",
            end: "100% 0%",
            scrub: 0,
          }),
        });

        LAYER_Y_PERCENTS.forEach((layerObj, idx) => {
          tl.to(
            triggerElement.querySelectorAll(
              `[data-parallax-layer="${layerObj.layer}"]`,
            ),
            {
              yPercent: layerObj.yPercent,
              ease: "none",
            },
            idx === 0 ? undefined : "<",
          );
        });
      });
    },
    [],
  );

  return (
    <div ref={rootRef} className={cn("parallax", className)}>
      <section className="parallax__header" aria-label={title}>
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow" aria-hidden="true" />
          <div data-parallax-layers className="parallax__layers">
            <Image
              src={LAYER_IMAGES.back}
              alt=""
              width={1600}
              height={900}
              data-parallax-layer="1"
              className="parallax__layer-img"
              priority
              sizes="100vw"
            />
            <Image
              src={LAYER_IMAGES.mid}
              alt=""
              width={1600}
              height={900}
              data-parallax-layer="2"
              className="parallax__layer-img"
              priority
              sizes="100vw"
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <p className="parallax__title">{title}</p>
            </div>
            <Image
              src={LAYER_IMAGES.front}
              alt=""
              width={1600}
              height={900}
              data-parallax-layer="4"
              className="parallax__layer-img is-third"
              priority
              sizes="100vw"
            />
          </div>
          <div className="parallax__fade" aria-hidden="true" />
        </div>
      </section>

      {showContentMark ? (
        <section className="parallax__content" aria-label="Parallax content">
          <div className="parallax__content-mark" data-parallax-content-mark>
            <Sparkles aria-hidden="true" strokeWidth={1.5} />
            <p>Keep scrolling — layers ease apart under native document scroll.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
