"use client";

import Image from "next/image";

import { HeroScrollHelper } from "@/components/sections/HeroScrollHelper";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { Container } from "@/components/ui/Container";
import { SplitText } from "@/components/ui/SplitText";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import { useParallax } from "@/hooks/useParallax";
import type { HomeHero } from "@/lib/cms/types";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";
import { SITE_MOTTO } from "@/lib/seo/constants";

type HeroOpeningProps = {
  hero: HomeHero;
  partners: PartnerPlaceholder[];
};

const HERO_BACKGROUND = "/assets/background.jpg";

/**
 * Full-bleed opening stage: brand + motto upper, partners marquee band lower.
 * CMS headline/subheadline/CTA stay on the hero prop for typing — not rendered.
 */
export function HeroOpening({ hero: _hero, partners }: HeroOpeningProps) {
  const rootRef = useOpeningAnimation<HTMLElement>();
  const parallaxRef = useParallax<HTMLDivElement>({ speed: 100 });

  return (
    <section
      id="home-hero"
      ref={rootRef}
      data-nav-theme="dark"
      className="relative min-h-[100svh] scroll-mt-0 overflow-hidden bg-[var(--color-charcoal)]"
      aria-label="Studio opening"
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
        {/* Soft bottom scrim — logo legibility only, not a section handoff */}
        <div
          data-testid="hero-bottom-scrim"
          className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--color-charcoal)]/70 via-[var(--color-charcoal)]/25 to-transparent md:h-44"
        />
      </div>

      <div
        data-opening-curtain
        className="pointer-events-none absolute inset-0 z-30 -translate-y-full bg-[var(--color-charcoal)] motion-reduce:hidden"
        aria-hidden="true"
      />

      <div
        data-testid="hero-opening-layout"
        className="relative z-10 flex min-h-[100svh] flex-col"
      >
        <HeroScrollHelper />
        <Container className="relative flex flex-1 flex-col py-10 md:py-14">
          <div
            data-testid="hero-brand-zone"
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
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
          </div>
        </Container>

        <div data-testid="hero-partners-zone" className="relative z-10 w-full shrink-0 pb-6 md:pb-8">
          <PartnersMarquee
            layout="band"
            tone="onDark"
            eyebrow="Trusted by"
            partners={partners}
          />
        </div>
      </div>
    </section>
  );
}
