"use client";

import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";
import { Container } from "@/components/ui/Container";

export type ServiceStackSlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  exploreHref: string;
};

type ServicesStackProps = {
  slides: ServiceStackSlide[];
};

const sectionId = "services-stack-heading";

const SECTION_BODY =
  "Five focused offerings—from games and products to design, branding, and community.";

export function ServicesStack({ slides }: ServicesStackProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      id="home-services"
      data-nav-theme="dark"
      aria-labelledby={sectionId}
      className="scroll-mt-4 bg-[var(--bg-primary)] py-16 md:py-24"
    >
      <Container>
        <CTAWithVerticalMarquee
          eyebrow="Services"
          heading="What we build"
          headingId={sectionId}
          body={SECTION_BODY}
          primaryCta={{ label: "View all services", href: "/services" }}
          secondaryCta={{ label: "Get in touch", href: "/contact" }}
          items={slides.map((slide) => ({
            id: slide.id,
            label: slide.title,
            href: slide.exploreHref,
          }))}
        />
      </Container>
    </section>
  );
}
