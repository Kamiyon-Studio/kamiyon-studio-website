import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import type { Portfolio } from "@/lib/cms/types";

import { toSeo, toSlug } from "../helpers";
import { portfolioId } from "../ids";
import type { SeedDocument } from "../types";

export function buildPortfolioDocument(item: Portfolio): SeedDocument {
  // Skip media: coverImage omitted; gallery left empty.
  return {
    _id: portfolioId(item.slug.current),
    _type: "portfolio",
    title: item.title,
    slug: toSlug(item.slug.current),
    clientName: item.clientName,
    industry: item.industry,
    serviceType: item.serviceType,
    challenge: item.challenge,
    solution: item.solution,
    impact: item.impact,
    ...(item.lessonsLearned ? { lessonsLearned: item.lessonsLearned } : {}),
    gallery: [],
    featured: item.featured,
    isPlaceholder: item.isPlaceholder,
    ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
    seo: toSeo(item.seo),
  };
}

export function buildPortfolioDocuments(
  source: Portfolio[] = portfolioItemsFallback
): SeedDocument[] {
  return source.map(buildPortfolioDocument);
}

/** @deprecated Use buildPortfolioDocument. */
export const buildCaseStudyDocument = buildPortfolioDocument;
/** @deprecated Use buildPortfolioDocuments. */
export const buildCaseStudyDocuments = buildPortfolioDocuments;
