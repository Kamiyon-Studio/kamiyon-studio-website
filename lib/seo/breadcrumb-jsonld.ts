import { PRODUCTION_CANONICAL_ORIGIN } from "./site-url";

export type BreadcrumbItem = {
  name: string;
  /** Absolute URL or site-relative path (e.g. `/services`). */
  href: string;
};

function toAbsoluteItemUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  if (href === "" || href === "/") {
    return PRODUCTION_CANONICAL_ORIGIN;
  }

  return `${PRODUCTION_CANONICAL_ORIGIN}${href.startsWith("/") ? href : `/${href}`}`;
}

/** BreadcrumbList with absolute item URLs on the production canonical origin. */
export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteItemUrl(item.href),
    })),
  };
}
