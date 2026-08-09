import type { MetadataRoute } from "next";

import {
  isCrawlableProduction,
  PRODUCTION_CANONICAL_HOST,
  PRODUCTION_CANONICAL_ORIGIN,
} from "./site-url";

const PRODUCTION_DISALLOW = [
  "/admin",
  "/admin/",
  "/api/",
  "/studio",
  "/studio/",
  "/motion-lab",
  "/motion-lab/",
] as const;

/**
 * Security-first robots policy:
 * - Crawlable production (canonical SITE_URL + production/unset APP_ENV):
 *   allow public pages; never allow /admin or /api/
 * - Staging/preview/dev APP_ENV or any non-canonical host: disallow all; no sitemap ad
 */
export function buildRobotsPolicy(
  siteUrl: string,
  appEnv?: string | null
): MetadataRoute.Robots {
  if (!isCrawlableProduction(siteUrl, appEnv)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRODUCTION_DISALLOW],
    },
    sitemap: `${PRODUCTION_CANONICAL_ORIGIN}/sitemap.xml`,
    host: PRODUCTION_CANONICAL_HOST,
  };
}
