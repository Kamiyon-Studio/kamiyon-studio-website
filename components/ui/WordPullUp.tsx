"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
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
  delayMultiple = 0.12,
  className,
  as: Tag = "h1",
  id,
  startOnView = true,
}: WordPullUpProps) {
  const containerRef = useRef<HTMLElement>(null);

  const classNames = cn(DISPLAY_HEADING_CLASS, className);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || prefersReducedMotion()) {
        return;
      }

      const wordEls = container.querySelectorAll(".word-pull-up-word");
      if (!wordEls.length) {
        return;
      }

      gsap.set(wordEls, { y: 20, opacity: 0 });

      const tween = gsap.to(wordEls, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: delayMultiple,
        ease: "power2.out",
        paused: startOnView,
      });

      if (startOnView) {
        ScrollTrigger.create({
          trigger: container,
          start: "top 85%",
          once: true,
          onEnter: () => tween.play(),
        });
      } else {
        tween.play();
      }
    },
    { scope: containerRef, dependencies: [words, delayMultiple, startOnView] },
  );

  if (prefersReducedMotion()) {
    return (
      <Tag id={id} className={classNames}>
        {words}
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef as never} id={id} className={classNames}>
      {words.split(" ").map((word, i, arr) => (
        <span
          key={`${word}-${i}`}
          className="word-pull-up-word inline-block pr-[0.35em]"
        >
          {word === "" ? "\u00a0" : word}
          {i < arr.length - 1 ? "\u00a0" : null}
        </span>
      ))}
    </Tag>
  );
}

export { WordPullUp };
