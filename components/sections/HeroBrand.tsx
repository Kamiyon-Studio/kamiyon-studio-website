"use client";

import { SplitText } from "@/components/ui/SplitText";
import { SITE_MOTTO } from "@/lib/seo/constants";

/** Wordmark + motto, shared by the static and parallax hero openings. */
export function HeroBrand() {
  return (
    <>
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
      <p className="mt-4 font-sans text-sm tracking-[0.22em] text-[var(--color-ivory)]/70 uppercase md:mt-5 md:text-base">
        {SITE_MOTTO}
      </p>
    </>
  );
}
