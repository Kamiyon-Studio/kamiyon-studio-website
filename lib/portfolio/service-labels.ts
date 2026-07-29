import {
  findTaxonomyTitle,
  isServiceCategoryValue,
  SERVICE_CATEGORIES,
} from "@/lib/cms/taxonomies";

/** Gate 0 service title for a portfolio.serviceType; undefined for stale/unknown. */
export function getPortfolioServiceLabel(
  serviceType: string
): string | undefined {
  return findTaxonomyTitle(SERVICE_CATEGORIES, serviceType);
}

/** `/services/[slug]` for valid Gate 0 types only. */
export function getPortfolioServiceHref(
  serviceType: string
): string | undefined {
  if (!isServiceCategoryValue(serviceType)) {
    return undefined;
  }

  return `/services/${serviceType}`;
}
