"use client";

import { AnimatedCarousel } from "@/components/ui/logo-carousel";
import { Container } from "@/components/ui/Container";
import {
  PARTNER_PLACEHOLDERS,
  type PartnerPlaceholder,
} from "@/lib/home/partner-placeholders";
import { cn } from "@/lib/utils";

type PartnersMarqueeEyebrow = "Trusted by" | "Clients";

type PartnersMarqueeProps = {
  eyebrow?: PartnersMarqueeEyebrow;
  partners?: PartnerPlaceholder[];
  /** Heading surface tone (logos keep original color). Default `onLight`. */
  tone?: "onLight" | "onDark";
  /** Standalone section vs compact hero band. Default `section`. */
  layout?: "section" | "band";
};

export function PartnersMarquee({
  eyebrow,
  partners = PARTNER_PLACEHOLDERS,
  tone: _tone = "onLight",
  layout = "section",
}: PartnersMarqueeProps) {
  const isBand = layout === "band";
  const showEyebrow = Boolean(eyebrow);
  const sectionLabel = eyebrow ?? "Partner logos";
  const logos = partners.map((partner) => ({
    src: partner.logoUrl,
    alt: partner.logoAlt?.trim() || partner.label,
    label: partner.label,
  }));

  return (
    <section
      id="home-partners"
      data-nav-theme={isBand ? "dark" : "light"}
      className={cn(
        "scroll-mt-4",
        isBand
          ? "bg-transparent py-4 md:py-6"
          : "bg-[var(--bg-secondary)] py-12 md:py-16",
      )}
      aria-label={sectionLabel}
    >
      <Container>
        {showEyebrow ? (
          <h3
            id="partners-marquee-eyebrow"
            className="text-center text-sm font-semibold uppercase tracking-wide text-sakura-ink"
          >
            {eyebrow}
          </h3>
        ) : null}

        <div
          className={showEyebrow ? "mt-6" : undefined}
          data-testid="partners-marquee-track"
        >
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
