"use client";

import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { SplitText } from "@/components/ui/SplitText";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import { useParallax } from "@/hooks/useParallax";
import type { AboutPage } from "@/lib/cms/types";

type AboutHeroProps = {
  aboutPage: AboutPage;
};

const HERO_BACKGROUND = "/assets/background.jpg";

/**
 * Full-viewport About opening — ABOUT US only (homepage-like stage).
 * Mission, motto, and quick links live elsewhere on the page.
 */
export function AboutHero({ aboutPage }: AboutHeroProps) {
  void aboutPage;
  const rootRef = useOpeningAnimation<HTMLElement>();
  const parallaxRef = useParallax<HTMLDivElement>({ speed: 100 });

  return (
    <section
      id="about-hero"
      ref={rootRef}
      data-nav-theme="dark"
      className="relative min-h-[100svh] scroll-mt-0 overflow-hidden bg-[var(--color-charcoal)]"
      aria-label="About us"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div
          ref={parallaxRef}
          className="absolute inset-[-20%] will-change-transform"
        >
          <Image
            src={HERO_BACKGROUND}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%] opacity-90"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/75 via-[var(--color-charcoal)]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-charcoal)]/55 via-transparent to-[var(--color-charcoal)]/40" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--color-charcoal)]/70 via-[var(--color-charcoal)]/25 to-transparent md:h-44" />
      </div>

      <div
        data-opening-curtain
        className="pointer-events-none absolute inset-0 z-30 -translate-y-full bg-[var(--color-charcoal)] motion-reduce:hidden"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <Container className="relative flex flex-1 flex-col py-10 md:py-14">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <SplitText
              tag="h1"
              text="ABOUT US"
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
        </Container>
      </div>
    </section>
  );
}
