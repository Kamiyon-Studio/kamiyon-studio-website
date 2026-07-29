import type { Metadata } from "next";

import { PortfolioListing } from "@/components/sections/PortfolioListing";
import { portfolioItemsFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getPortfolioItems } from "@/lib/cms/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio",
  description:
    "Explore how Kamiyon Studio approaches client work: the challenge each project presented, the solution we built, and the impact it had.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const portfolioItems = resolveWithFallback(
    await getPortfolioItems(),
    portfolioItemsFallback
  );

  return <PortfolioListing caseStudies={portfolioItems} />;
}
