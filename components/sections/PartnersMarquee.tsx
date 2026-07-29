"use client";

import { AnimatedCarousel } from "@/components/ui/logo-carousel";
import { Container } from "@/components/ui/Container";
import {
  PARTNER_PLACEHOLDERS,
  type PartnerPlaceholder,
} from "@/lib/home/partner-placeholders";

type PartnersMarqueeEyebrow = "Trusted by" | "Clients";

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
      data-nav-theme="light"
      className="scroll-mt-4 bg-[var(--bg-secondary)] py-12 md:py-16"
      aria-label={sectionLabel}
    >
      <Container>
        {eyebrow ? (
          <p
            id="partners-marquee-eyebrow"
            className="text-center text-sm font-semibold uppercase tracking-wide text-sakura-ink"
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
            contentClassName="w-full"
            carouselClassName="partners-logo-carousel"
          />
        </div>
      </Container>
    </section>
  );
}
