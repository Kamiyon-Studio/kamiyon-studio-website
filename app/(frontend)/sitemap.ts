import type { MetadataRoute } from "next";

import {
  portfolioItemsFallback,
  postsFallback,
  servicesFallback,
} from "@/lib/cms/fallbacks";
import { getPortfolioItems, getPosts, getServices } from "@/lib/cms/queries";
import { buildPublicSitemapEntries } from "@/lib/seo/sitemap-entries";
import { SITE_URL } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, portfolioItems, posts] = await Promise.all([
    getServices(),
    getPortfolioItems(),
    getPosts(),
  ]);

  return buildPublicSitemapEntries({
    siteUrl: SITE_URL,
    services: services ?? servicesFallback,
    portfolioItems: portfolioItems ?? portfolioItemsFallback,
    posts: posts ?? postsFallback,
    appEnv: process.env.APP_ENV,
  });
}
