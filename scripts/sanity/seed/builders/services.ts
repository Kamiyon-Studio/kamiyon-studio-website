import { servicesFallback } from "@/lib/cms/fallbacks/services";
import type { Service } from "@/lib/cms/types";

import { toPortableBody, toSeo, toSlug } from "../helpers";
import { serviceId } from "../ids";
import type { SeedDocument } from "../types";

/**
 * Flat service seed (ADR-016 / Gate 0).
 * Emits tagline + capabilities; no category ref, outcomes, or relatedIndustries.
 */
export function buildServiceDocument(service: Service): SeedDocument {
  return {
    _id: serviceId(service.slug.current),
    _type: "service",
    title: service.title,
    slug: toSlug(service.slug.current),
    tagline: service.tagline,
    summary: service.summary,
    body: toPortableBody(service.body, `service-${service.slug.current}`),
    capabilities: [...service.capabilities],
    ...(service.icon ? { icon: service.icon } : {}),
    order: service.order,
    isPlaceholder: service.isPlaceholder,
    seo: toSeo(service.seo),
  };
}

export function buildServiceDocuments(
  source: Service[] = servicesFallback
): SeedDocument[] {
  return source.map(buildServiceDocument);
}
