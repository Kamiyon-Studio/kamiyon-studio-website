import type { MetadataRoute } from "next";

import { portfolioItemsFallback, servicesFallback } from "@/lib/cms/fallbacks";
import { getPortfolioItems, getServices } from "@/lib/cms/queries";
import { buildPublicSitemapEntries } from "@/lib/seo/sitemap-entries";
import { SITE_URL } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, portfolioItems] = await Promise.all([
    getServices(),
    getPortfolioItems(),
  ]);

  return buildPublicSitemapEntries({
    siteUrl: SITE_URL,
    services: services ?? servicesFallback,
    portfolioItems: portfolioItems ?? portfolioItemsFallback,
    appEnv: process.env.APP_ENV,
  });
}
