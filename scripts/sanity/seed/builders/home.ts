/**
 * RFC — Sanity ↔ Frontend Align §4
 * Home seed emits named refs (partners, portfolio, awards, testimonials,
 * services) + contactCta. Testimonials are team-roster preview quotes so the
 * Home marquee can be reviewed; replace with consented quotes (ADR-031).
 * No hero / blocks.
 */

import { awardsFallback } from "@/lib/cms/fallbacks/awards";
import {
  homePageFallback,
  type HomePageFallbackShape,
} from "@/lib/cms/fallbacks/home";
import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import { servicesFallback } from "@/lib/cms/fallbacks/services";
import { testimonialsFallback } from "@/lib/cms/fallbacks/testimonials";
import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";

import { arrayKey, toReference, toSeo } from "../helpers";
import {
  awardId,
  partnerId,
  portfolioId,
  serviceId,
  SINGLETON_IDS,
  slugifyName,
  testimonialId,
} from "../ids";
import type { SeedDocument } from "../types";

function mapContactCta(source: HomePageFallbackShape["contactCta"]) {
  return {
    title: source.title,
    body: source.body,
    ctaLabel: source.ctaLabel,
    ctaHref: source.ctaHref,
  };
}

/**
 * Pre-fill Home refs with what the site shows today (partners, portfolio,
 * award slots, team-roster testimonials, five Gate 0 services).
 * title / contactCta / seo come from source.
 */
export function buildHomePageDocument(
  source: HomePageFallbackShape = homePageFallback,
): SeedDocument {
  return {
    _id: SINGLETON_IDS.homePage,
    _type: "homePage",
    title: source.title,
    partners: PARTNER_PLACEHOLDERS.map((placeholder, i) =>
      toReference(partnerId(placeholder.id), arrayKey("partner", i)),
    ),
    portfolioItems: portfolioItemsFallback.map((item, i) =>
      toReference(portfolioId(item.slug.current), arrayKey("portfolio", i)),
    ),
    awards: awardsFallback.map((_, i) =>
      toReference(awardId(`slot-${i + 1}`), arrayKey("award", i)),
    ),
    testimonials: testimonialsFallback.map((item, i) =>
      toReference(testimonialId(slugifyName(item.name)), arrayKey("testimonial", i)),
    ),
    services: servicesFallback.map((service, i) =>
      toReference(serviceId(service.slug.current), arrayKey("service", i)),
    ),
    contactCta: mapContactCta(source.contactCta),
    seo: toSeo(source.seo),
  };
}
