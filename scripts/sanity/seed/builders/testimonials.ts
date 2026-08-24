/**
 * Testimonial seed builders from the team-roster preview list.
 * Source: lib/cms/fallbacks/testimonials.ts (read-only). Preview quotes use
 * current team names so Home can show the marquee; replace with consented
 * quotes before treating them as social proof (ADR-031).
 */

import { testimonialsFallback } from "@/lib/cms/fallbacks/testimonials";
import type { Testimonial } from "@/lib/cms/types";

import { slugifyName, testimonialId } from "../ids";
import type { SeedDocument } from "../types";

export function buildTestimonialDocument(item: Testimonial): SeedDocument {
  return {
    _id: testimonialId(slugifyName(item.name)),
    _type: "testimonial",
    quote: item.quote,
    name: item.name,
    ...(item.role ? { role: item.role } : {}),
    order: item.order,
  };
}

export function buildTestimonialDocuments(
  source: readonly Testimonial[] = testimonialsFallback,
): SeedDocument[] {
  return source.map(buildTestimonialDocument);
}
