"use client";

import { LogoMarquee } from "@/components/ui/logo-marquee";
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
  /** Heading surface tone (logos use grayscale → color on hover). Default `onLight`. */
  tone?: "onLight" | "onDark";
  /** Standalone section vs compact hero band. Default `section`. */
  layout?: "section" | "band";
};

const PARTNER_LOGO_IMAGE_CLASS =
  "h-14 w-auto max-w-[10rem] md:h-16 md:max-w-[12rem] lg:h-20 lg:max-w-[14rem]";

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
    id: partner.id,
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
          <LogoMarquee
            logos={logos}
            speed={40}
            pauseOnHover
            logoImageClassName={PARTNER_LOGO_IMAGE_CLASS}
          />
        </div>
      </Container>
    </section>
  );
}
