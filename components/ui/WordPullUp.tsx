"use client";

import { useRef } from "react";

import { useGsapContext } from "@/hooks/useGsapContext";
import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import {
  MOTION_DISTANCE,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
} from "@/lib/motion/constants";
import { DISPLAY_HEADING_CLASS } from "@/lib/ui/display-heading";
import { cn } from "@/lib/utils";

type WordPullUpTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

type WordPullUpProps = {
  words: string;
  delayMultiple?: number;
  className?: string;
  as?: WordPullUpTag;
  id?: string;
  /** When true (default), animate when the heading scrolls into view. */
  startOnView?: boolean;
};

/**
 * Standard marketing heading entrance: words pull up with a stagger (GSAP).
 */
function WordPullUp({
  words,
  delayMultiple = MOTION_STAGGER.base,
  className,
  as: Tag = "h1",
  id,
  startOnView = true,
}: WordPullUpProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  const classNames = cn(DISPLAY_HEADING_CLASS, className);

  useGsapContext(
    containerRef,
    () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const wordEls = container.querySelectorAll(".word-pull-up-word");
      if (!wordEls.length) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(wordEls, { autoAlpha: 1, y: 0 });
      });

      mm.add(GSAP_ALLOW_MOTION, () => {
        const from = {
          autoAlpha: 0,
          y: MOTION_DISTANCE.staggerY,
        };
        const to = {
          autoAlpha: 1,
          y: 0,
          duration: MOTION_DURATION.base,
          stagger: delayMultiple,
          ease: MOTION_EASE.out,
        };

        if (startOnView) {
          gsap.fromTo(wordEls, from, {
            ...to,
            scrollTrigger: createScrollTriggerDefaults({
              trigger: container,
              once: true,
            }),
          });
          return;
        }

        gsap.fromTo(wordEls, from, to);
      });
    },
    [words, delayMultiple, startOnView],
  );

  // Rendered identically regardless of motion preference: reduced-motion is
  // handled in the GSAP matchMedia effect, so the words stay in one tree and
  // avoid server/client hydration mismatches.
  return (
    <Tag ref={containerRef as never} id={id} className={classNames}>
      {words.split(" ").flatMap((word, i, arr) => {
        const span = (
          <span
            key={`${word}-${i}`}
            className="word-pull-up-word inline-block pr-[0.35em]"
          >
            {word === "" ? "\u00a0" : word}
          </span>
        );

        // Separator sits *outside* the span on purpose: accessible-name
        // computation trims each element's own text, so a space kept inside
        // would be dropped and the heading would announce as one run-on word.
        // Must stay breaking whitespace, or long headings cannot wrap.
        return i < arr.length - 1 ? [span, " "] : [span];
      })}
    </Tag>
  );
}

export { WordPullUp };
