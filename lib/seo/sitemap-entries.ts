import type { MetadataRoute } from "next";

import { isServiceCategoryValue } from "@/lib/cms/taxonomies";

import {
  isCrawlableProduction,
  PRODUCTION_CANONICAL_ORIGIN,
  normalizeSiteUrl,
} from "./site-url";

const STATIC_ROUTES = [
  "",
  "/about",
  "/services",
  "/portfolio",
  "/contact",
  "/blog",
] as const;

type SitemapSeo = {
  noIndex?: boolean;
};

type SitemapSlugDoc = {
  slug: { current: string };
  seo?: SitemapSeo;
  publishedAt?: string;
};

export type BuildPublicSitemapEntriesInput = {
  siteUrl: string;
  services: SitemapSlugDoc[];
  portfolioItems: SitemapSlugDoc[];
  /** Deployment env (`APP_ENV`); staging/preview/development always fail-closed. */
  appEnv?: string | null;
};

export function isSitemapIndexable(doc: { seo?: SitemapSeo }): boolean {
  return doc.seo?.noIndex !== true;
}

/** Gate 0 five-service slugs only — skip orphan / pre-migration CMS paths. */
export function isSitemapServiceSlug(slug: string): boolean {
  return isServiceCategoryValue(slug);
}

function toAbsoluteUrl(path: string): string {
  return path === ""
    ? PRODUCTION_CANONICAL_ORIGIN
    : `${PRODUCTION_CANONICAL_ORIGIN}${path}`;
}

function entryForSlug(
  pathPrefix: string,
  doc: SitemapSlugDoc,
  options?: { requireCanonicalServiceSlug?: boolean }
): MetadataRoute.Sitemap[number] | null {
  if (!isSitemapIndexable(doc) || !doc.slug.current) {
    return null;
  }

  if (
    options?.requireCanonicalServiceSlug &&
    !isSitemapServiceSlug(doc.slug.current)
  ) {
    return null;
  }

  const entry: MetadataRoute.Sitemap[number] = {
    url: toAbsoluteUrl(`${pathPrefix}/${doc.slug.current}`),
  };

  if (doc.publishedAt) {
    entry.lastModified = new Date(doc.publishedAt);
  }

  return entry;
}

/**
 * Public indexable URLs only, always on the production canonical origin.
 * Non-crawlable deployments (preview/dev or non-canonical SITE_URL) get an
 * empty sitemap (robots already disallow all).
 * Service detail URLs are limited to the Gate 0 five slugs (ADR-016).
 */
export function buildPublicSitemapEntries(
  input: BuildPublicSitemapEntriesInput
): MetadataRoute.Sitemap {
  if (
    !isCrawlableProduction(normalizeSiteUrl(input.siteUrl), input.appEnv)
  ) {
    return [];
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: toAbsoluteUrl(path),
  }));

  const serviceEntries = input.services
    .map((service) =>
      entryForSlug("/services", service, { requireCanonicalServiceSlug: true })
    )
    .filter((entry): entry is MetadataRoute.Sitemap[number] => entry !== null);

  const portfolioEntries = input.portfolioItems
    .map((item) => entryForSlug("/portfolio", item))
    .filter((entry): entry is MetadataRoute.Sitemap[number] => entry !== null);

  return [...staticEntries, ...serviceEntries, ...portfolioEntries];
}
