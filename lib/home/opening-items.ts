import { getCmsImageUrl } from "@/lib/cms/image";
import type { CaseStudy, Product } from "@/lib/cms/types";

export const OPENING_ITEM_LIMIT = 5;
export const OPENING_FALLBACK_IMAGE = "/assets/background.jpg";

export type OpeningItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

type BuildOpeningItemsInput = {
  caseStudies: CaseStudy[];
  products: Product[];
  featuredCaseStudySlugs?: string[];
  featuredProductSlugs?: string[];
  limit?: number;
};

function productImage(product: Product): { src: string; alt: string } {
  const media = product.media.find((item) => item.type === "image");
  const url = getCmsImageUrl(media?.asset);
  return {
    src: url ?? OPENING_FALLBACK_IMAGE,
    alt: media?.alt?.trim() || `${product.title} preview`,
  };
}

function caseStudyImage(caseStudy: CaseStudy): { src: string; alt: string } {
  const url = getCmsImageUrl(caseStudy.coverImage);
  return {
    src: url ?? OPENING_FALLBACK_IMAGE,
    alt: caseStudy.coverImage?.alt?.trim() || `${caseStudy.title} cover`,
  };
}

function orderByFeaturedSlugs<T extends { slug: { current: string } }>(
  items: T[],
  featuredSlugs: string[] | undefined
): T[] {
  if (!featuredSlugs?.length) {
    return items;
  }

  const bySlug = new Map(items.map((item) => [item.slug.current, item]));
  const featured = featuredSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is T => item != null);
  const featuredSet = new Set(featuredSlugs);
  const rest = items.filter((item) => !featuredSet.has(item.slug.current));
  return [...featured, ...rest];
}

/**
 * Builds the Il Capo–style vertical opening list: featured products then case studies.
 */
export function buildOpeningItems({
  caseStudies,
  products,
  featuredCaseStudySlugs,
  featuredProductSlugs,
  limit = OPENING_ITEM_LIMIT,
}: BuildOpeningItemsInput): OpeningItem[] {
  const orderedProducts = orderByFeaturedSlugs(products, featuredProductSlugs);
  const orderedStudies = orderByFeaturedSlugs(
    caseStudies,
    featuredCaseStudySlugs
  );

  const productItems: OpeningItem[] = orderedProducts.map((product) => {
    const image = productImage(product);
    return {
      id: `product-${product.slug.current}`,
      title: product.title,
      subtitle: product.genre,
      href: `/products/${product.slug.current}`,
      imageSrc: image.src,
      imageAlt: image.alt,
    };
  });

  const studyItems: OpeningItem[] = orderedStudies.map((study) => {
    const image = caseStudyImage(study);
    return {
      id: `case-${study.slug.current}`,
      title: study.title,
      subtitle: study.clientName,
      href: `/portfolio/${study.slug.current}`,
      imageSrc: image.src,
      imageAlt: image.alt,
    };
  });

  return [...productItems, ...studyItems].slice(0, limit);
}

export function formatOpeningIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}
