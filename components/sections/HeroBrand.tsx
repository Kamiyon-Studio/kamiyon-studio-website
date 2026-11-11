"use client";

import { Button } from "@/components/ui/Button";
import { SplitText } from "@/components/ui/SplitText";
import { SITE_MOTTO } from "@/lib/seo/constants";

/** Soft sakura bloom around the glyphs. 0-offset so it reads as glow, not a drop shadow. */
const WORDMARK_GLOW_CLASS =
  "inline-flex [filter:drop-shadow(0_0_0.2em_color-mix(in_srgb,var(--color-primary)_34%,transparent))_drop-shadow(0_0_0.5em_color-mix(in_srgb,var(--color-primary)_12%,transparent))]";

/** Wordmark + motto, shared by the static and parallax hero openings. */
export function HeroBrand() {
  return (
    <>
      <div className={WORDMARK_GLOW_CLASS}>
        <SplitText
          tag="h1"
          text="KAMIYON STUDIO"
          className="font-display text-[clamp(2.5rem,8vw,6rem)] font-bold tracking-tight text-[var(--color-ivory)]"
          delay={80}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
      </div>
      <p className="mt-4 font-sans text-sm tracking-[0.22em] text-[var(--color-ivory)]/70 uppercase md:mt-5 md:text-base">
        {SITE_MOTTO}
      </p>
      <p className="mt-5 max-w-xl text-base text-[var(--color-ivory)] md:text-lg">
        Games, digital products, and design from an independent Philippine
        studio.
      </p>
      <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-3">
        <Button href="/portfolio">View our work</Button>
        <Button href="/contact" variant="secondary">
          Discuss a project
        </Button>
      </div>
    </>
  );
}
