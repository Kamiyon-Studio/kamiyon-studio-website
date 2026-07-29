import { homePageFallback } from "@/lib/cms/fallbacks/home";
import type {
  HomeBlock,
  HomeCtaBanner,
  HomeFeaturedWork,
  HomeHero,
  HomeHighlights,
  HomeMission,
  HomePage,
} from "@/lib/cms/types";

import { arrayKey, toReference, toSeo } from "../helpers";
import { portfolioId, productId, SINGLETON_IDS } from "../ids";
import type { SeedDocument } from "../types";

function mapHero(block: HomeHero, index: number) {
  // Skip media: hero.image intentionally omitted.
  return {
    _type: "hero" as const,
    _key: arrayKey("block", index),
    headline: block.headline,
    subheadline: block.subheadline,
    ctaLabel: block.ctaLabel,
    ctaHref: block.ctaHref,
  };
}

function mapMission(block: HomeMission, index: number) {
  return {
    _type: "mission" as const,
    _key: arrayKey("block", index),
    title: block.title,
    body: block.body,
  };
}

/**
 * Fallback stores slug arrays; Sanity schema expects references.
 * `featuredProductSlugs` → `featuredProducts`, `featuredCaseStudySlugs` → `featuredCaseStudies`.
 */
function mapFeaturedWork(block: HomeFeaturedWork, index: number) {
  return {
    _type: "featuredWork" as const,
    _key: arrayKey("block", index),
    title: block.title,
    body: block.body,
    featuredProducts: block.featuredProductSlugs.map((slug, i) =>
      toReference(productId(slug), arrayKey("featured-product", i))
    ),
    featuredCaseStudies: block.featuredCaseStudySlugs.map((slug, i) =>
      toReference(portfolioId(slug), arrayKey("featured-portfolio", i))
    ),
  };
}

function mapHighlights(block: HomeHighlights, index: number) {
  return {
    _type: "highlights" as const,
    _key: arrayKey("block", index),
    title: block.title,
    items: block.items.map((item, itemIndex) => ({
      _type: "homeHighlight",
      _key: arrayKey("highlight", itemIndex),
      title: item.title,
      description: item.description,
      ...(item.icon ? { icon: item.icon } : {}),
    })),
  };
}

function mapCtaBanner(block: HomeCtaBanner, index: number) {
  return {
    _type: "ctaBanner" as const,
    _key: arrayKey("block", index),
    title: block.title,
    body: block.body,
    ctaLabel: block.ctaLabel,
    ctaHref: block.ctaHref,
  };
}

function mapBlock(block: HomeBlock, index: number) {
  switch (block._type) {
    case "hero":
      return mapHero(block, index);
    case "mission":
      return mapMission(block, index);
    case "featuredWork":
      return mapFeaturedWork(block, index);
    case "highlights":
      return mapHighlights(block, index);
    case "ctaBanner":
      return mapCtaBanner(block, index);
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export function buildHomePageDocument(
  source: HomePage = homePageFallback
): SeedDocument {
  return {
    _id: SINGLETON_IDS.homePage,
    _type: "homePage",
    title: source.title,
    blocks: source.blocks.map(mapBlock),
    seo: toSeo(source.seo),
  };
}
