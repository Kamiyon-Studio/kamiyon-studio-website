"use client";

import Image from "next/image";

import { AnimatedCarousel } from "@/components/ui/logo-carousel";
import { Container } from "@/components/ui/Container";
import {
  PARTNER_PLACEHOLDERS,
  type PartnerPlaceholder,
} from "@/lib/home/partner-placeholders";

/** Same asset + crop as the hero — flipped vertically for a mirror junction. */
const PARTNERS_BACKGROUND = "/assets/background.jpg";

type PartnersMarqueeEyebrow = "Partners" | "Clients";

type PartnersMarqueeProps = {
  eyebrow?: PartnersMarqueeEyebrow;
  partners?: PartnerPlaceholder[];
};

export function PartnersMarquee({
  eyebrow,
  partners = PARTNER_PLACEHOLDERS,
}: PartnersMarqueeProps) {
  const sectionLabel = eyebrow ?? "Partner logos";
  const logos = partners.map((partner) => ({
    src: partner.logoUrl,
    alt: partner.logoAlt?.trim() || partner.label,
    label: partner.label,
  }));

  return (
    <section
      id="home-partners"
      data-nav-theme="dark"
      className="relative scroll-mt-4 overflow-hidden bg-[var(--color-charcoal)] py-12 md:py-16"
      aria-label={sectionLabel}
    >
      <div className="absolute inset-0" aria-hidden="true" data-testid="partners-mirror-bg">
        {/* Exact hero crop, vertically flipped + blurred */}
        <div className="absolute inset-[-12%] scale-y-[-1]">
          <Image
            src={PARTNERS_BACKGROUND}
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover object-[center_35%] opacity-90 blur-md"
          />
        </div>
        {/* Mirrored hero scrims (vertical stops inverted) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/80 via-[var(--color-charcoal)]/45 to-[var(--color-charcoal)]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-charcoal)]/55 via-transparent to-[var(--color-charcoal)]/40" />
        {/* Soft handoff into ProjectsBento (`--bg-primary`) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[var(--bg-primary)]" />
      </div>

      <Container className="relative z-10">
        {eyebrow ? (
          <p
            id="partners-marquee-eyebrow"
            className="text-center text-sm font-semibold uppercase tracking-wide text-[var(--color-ivory)]/80"
          >
            {eyebrow}
          </p>
        ) : null}

        <div className={eyebrow ? "mt-6" : undefined} data-testid="partners-marquee-track">
          <AnimatedCarousel
            logos={logos}
            autoPlay
            autoPlayInterval={4000}
            itemsPerViewMobile={2}
            itemsPerViewDesktop={4}
            itemGap="md"
            logoContainerWidth="w-full"
            logoContainerHeight="h-auto"
            logoContainerMinWidth="min-w-0"
            logoImageWidth="w-auto"
            logoImageHeight="h-10"
            padding="py-0"
            containerClassName="bg-transparent"
            contentClassName="w-full [&_.group]:text-[var(--color-ivory)]/70 [&_img]:brightness-0 [&_img]:invert"
            carouselClassName="partners-logo-carousel"
          />
        </div>
      </Container>
    </section>
  );
}
