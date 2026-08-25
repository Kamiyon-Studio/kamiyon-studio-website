import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import type { Portfolio } from "@/lib/cms/types";

import { arrayKey, toPortableBody, toR2Asset, toReference, toSeo, toSlug } from "../helpers";
import { portfolioId } from "../ids";
import type { SeedDocument } from "../types";

function omitEmpty<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

export function buildPortfolioDocument(item: Portfolio): SeedDocument {
  return omitEmpty({
    _id: portfolioId(item.slug.current),
    _type: "portfolio",
    title: item.title,
    slug: toSlug(item.slug.current),
    projectType: item.projectType,
    clientName: item.clientName,
    industry: item.industry,
    serviceType: item.serviceType,
    ...(item.status ? { status: item.status } : {}),
    ...(item.developmentPeriod ? { developmentPeriod: item.developmentPeriod } : {}),
    shortDescription: item.shortDescription,
    ...(item.positioning ? { positioning: item.positioning } : {}),
    challenge: item.challenge,
    solution: item.solution,
    impact: item.impact,
    ...(item.lessonsLearned ? { lessonsLearned: item.lessonsLearned } : {}),
    ...(item.creativeDirection?.length
      ? { creativeDirection: toPortableBody(item.creativeDirection, "creative") }
      : {}),
    ...(item.process?.length ? { process: toPortableBody(item.process, "process") } : {}),
    ...(item.narrative?.length
      ? { narrative: toPortableBody(item.narrative, "narrative") }
      : {}),
    ...(item.technicalDevelopment
      ? {
          technicalDevelopment: omitEmpty({
            ...(item.technicalDevelopment.engine
              ? { engine: item.technicalDevelopment.engine }
              : {}),
            ...(item.technicalDevelopment.platforms
              ? { platforms: item.technicalDevelopment.platforms }
              : {}),
            ...(item.technicalDevelopment.input
              ? { input: item.technicalDevelopment.input }
              : {}),
            ...(item.technicalDevelopment.origin
              ? { origin: item.technicalDevelopment.origin }
              : {}),
            ...(item.technicalDevelopment.systems.length
              ? { systems: [...item.technicalDevelopment.systems] }
              : {}),
            ...(item.technicalDevelopment.body?.length
              ? { body: toPortableBody(item.technicalDevelopment.body, "technical") }
              : {}),
          }),
        }
      : {}),
    ...(item.gameplay
      ? {
          gameplay: omitEmpty({
            ...(item.gameplay.mechanics?.length
              ? { mechanics: toPortableBody(item.gameplay.mechanics, "mechanics") }
              : {}),
            ...(item.gameplay.dualStateTable
              ? {
                  dualStateTable: {
                    leftLabel: item.gameplay.dualStateTable.leftLabel,
                    rightLabel: item.gameplay.dualStateTable.rightLabel,
                    rows: item.gameplay.dualStateTable.rows.map((row, index) => ({
                      _key: row._key ?? arrayKey("dual", index),
                      aspect: row.aspect,
                      left: row.left,
                      right: row.right,
                    })),
                  },
                }
              : {}),
            ...(item.gameplay.controls.length
              ? {
                  controls: item.gameplay.controls.map((control, index) => ({
                    _key: control._key ?? arrayKey("control", index),
                    input: control.input,
                    action: control.action,
                  })),
                }
              : {}),
          }),
        }
      : {}),
    ...(item.credits.length
      ? {
          credits: item.credits.map((credit, index) =>
            omitEmpty({
              _key: credit._key ?? arrayKey("credit", index),
              name: credit.name,
              role: credit.role,
              ...(credit.person?.id ? { person: toReference(credit.person.id) } : {}),
            }),
          ),
        }
      : {}),
    ...(item.recognition.length
      ? {
          recognition: item.recognition.map((entry, index) =>
            omitEmpty({
              _key: entry._key ?? arrayKey("recognition", index),
              title: entry.title,
              organization: entry.organization,
              year: entry.year,
              ...(entry.url ? { url: entry.url } : {}),
              ...(entry.note ? { note: entry.note } : {}),
            }),
          ),
        }
      : {}),
    ...(item.coverImage ? { coverImage: toR2Asset(item.coverImage) } : {}),
    gallery: item.gallery.map((image, index) => toR2Asset(image, arrayKey("gallery", index))),
    featured: item.featured,
    isPlaceholder: item.isPlaceholder,
    ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
    seo: toSeo(item.seo),
  });
}

export function buildPortfolioDocuments(
  source: Portfolio[] = portfolioItemsFallback,
): SeedDocument[] {
  return source.map(buildPortfolioDocument);
}

/** @deprecated Use buildPortfolioDocument. */
export const buildCaseStudyDocument = buildPortfolioDocument;
/** @deprecated Use buildPortfolioDocuments. */
export const buildCaseStudyDocuments = buildPortfolioDocuments;
