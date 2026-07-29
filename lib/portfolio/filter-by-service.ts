import type { CaseStudy } from "@/lib/cms/types";
import {
  isServiceCategoryValue,
  SERVICE_CATEGORIES,
  type ServiceCategoryValue,
} from "@/lib/cms/taxonomies";

export type PortfolioServiceFilterValue = ServiceCategoryValue | "all";

/**
 * Gate 0 services present in the given portfolio items, in taxonomy order.
 * Unknown / stale serviceType values never become filter options.
 */
export function getAvailableServices(
  items: CaseStudy[]
): ServiceCategoryValue[] {
  const present = new Set<ServiceCategoryValue>();

  for (const item of items) {
    if (isServiceCategoryValue(item.serviceType)) {
      present.add(item.serviceType);
    }
  }

  return SERVICE_CATEGORIES.map((option) => option.value).filter((value) =>
    present.has(value)
  );
}

/** Filters portfolio items by serviceType; "all" is a pass-through. */
export function filterPortfolioByService(
  items: CaseStudy[],
  service: PortfolioServiceFilterValue
): CaseStudy[] {
  if (service === "all") {
    return items;
  }

  return items.filter((item) => item.serviceType === service);
}
