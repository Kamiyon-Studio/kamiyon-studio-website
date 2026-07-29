"use client";

import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";
import { type ImageSource } from "@/components/ui/reveal-images";
import { Container } from "@/components/ui/Container";

export type ServiceStackSlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  exploreHref: string;
  /** Optional pair of images for the hover reveal effect. */
  images?: [ImageSource, ImageSource];
};

type ServicesStackProps = {
  slides: ServiceStackSlide[];
};

const sectionId = "services-stack-heading";

const SECTION_BODY =
  "Five focused offerings—from games and products to design, branding, and community.";

/**
 * Static image pairs (Unsplash) keyed by service slug.
 * Using a static map keeps CMS free of image requirements while the
 * hover reveal adds visual richness to the homepage services marquee.
 */
const SERVICE_IMAGES: Record<string, [ImageSource, ImageSource]> = {
  "game-development": [
    {
      src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=60",
      alt: "Game controller on a colourful background",
    },
    {
      src: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&auto=format&fit=crop&q=60",
      alt: "Person playing a video game",
    },
  ],
  "product-development": [
    {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=60",
      alt: "Laptop showing analytics dashboard",
    },
    {
      src: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&auto=format&fit=crop&q=60",
      alt: "Mobile app wireframe on screen",
    },
  ],
  "ui-design": [
    {
      src: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=200&auto=format&fit=crop&q=60",
      alt: "Designer working on UI components",
    },
    {
      src: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&auto=format&fit=crop&q=60",
      alt: "Colourful UI design on a tablet",
    },
  ],
  branding: [
    {
      src: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=200&auto=format&fit=crop&q=60",
      alt: "Brand identity elements laid out on a surface",
    },
    {
      src: "https://images.unsplash.com/photo-1567262439850-1d4dc1fefdd0?w=200&auto=format&fit=crop&q=60",
      alt: "Logo design sketch",
    },
  ],
  "community-events": [
    {
      src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&auto=format&fit=crop&q=60",
      alt: "Crowd at a community event",
    },
    {
      src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=60",
      alt: "Conference hall with attendees",
    },
  ],
};

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
            // Use slide-level images if provided; fall back to the static map.
            images: slide.images ?? SERVICE_IMAGES[slide.id],
          }))}
        />
      </Container>
    </section>
  );
}
