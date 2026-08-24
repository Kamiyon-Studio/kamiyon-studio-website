import { INTERIM_CONTACT_FORM_URL } from "@/lib/contact/channels";

/**
 * RFC — Sanity ↔ Frontend Align §1.1 / §4
 *
 * Named-field home singleton shape. Hub owns `lib/cms/types.ts` HomePage update
 * in Layer 2 — local shape matches the RFC until then.
 *
 * List fields stay empty here so CMS-null still uses separate collection
 * fallbacks on the current page; seed pre-fills refs independently.
 */
type HomePageContactCta = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomePageFallbackShape = {
  _type: "homePage";
  title: string;
  partners: [];
  portfolioItems: [];
  awards: [];
  testimonials: [];
  services: [];
  contactCta: HomePageContactCta;
  seo: {
    title: string;
    description: string;
  };
};

export const homePageFallback: HomePageFallbackShape = {
  _type: "homePage",
  title: "Home",
  partners: [],
  portfolioItems: [],
  awards: [],
  testimonials: [],
  services: [],
  contactCta: {
    title: "Let’s build something meaningful.",
    body: "Tell us what you want to create, teach, or explore. We will help shape the right interactive experience around it.",
    ctaLabel: "Get in touch",
    ctaHref: INTERIM_CONTACT_FORM_URL,
  },
  seo: {
    title: "Kamiyon Studio",
    description:
      "Kamiyon Studio creates games and interactive experiences that educate, inspire, and make a lasting impact.",
  },
};
