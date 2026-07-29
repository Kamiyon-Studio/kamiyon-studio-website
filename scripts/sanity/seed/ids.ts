/**
 * Stable Sanity document IDs for seed upserts.
 *
 * ## ID strategy (WS8d)
 *
 * Collections use `{type}-{slug}` (hyphen), e.g. `product-eclipse`.
 * Singletons use the type name (e.g. `siteSettings`).
 *
 * ### Why not `{type}.{slug}` (dotted)?
 *
 * Sanity treats `_id`s containing `.` as path-private: unauthenticated Content
 * Lake queries (root path only) omit them — collections return `[]` even on a
 * public dataset. See https://www.sanity.io/docs/content-lake/ids
 *
 * App fetch (`sanity/lib/client.ts`) uses `useCdn: false` but **no**
 * `SANITY_API_READ_TOKEN`, so dotted seed IDs would be invisible to the site.
 * Hyphen IDs stay on the public root path and match home/service refs built
 * via these helpers.
 *
 * Plan IDs were `partner.partner-1` / `product.eclipse`; seed IDs are now
 * `partner-partner-1` / `product-eclipse`.
 */

export const SINGLETON_IDS = {
  siteSettings: "siteSettings",
  homePage: "homePage",
  aboutPage: "aboutPage",
  contactPage: "contactPage",
} as const;

export type CollectionType =
  | "product"
  | "caseStudy"
  | "portfolio"
  | "teamMember"
  | "serviceCategory"
  | "service"
  | "communityItem"
  | "partner"
  | "author"
  | "category"
  | "tag"
  | "post";

/**
 * Build a collection document ID: `{type}-{slug}`.
 * Hyphen separator — do not use `.` (path-private; see file header).
 */
export function collectionId(type: CollectionType, slug: string): string {
  return `${type}-${slug}`;
}

/** Slugify a display name into a stable collection slug segment. */
export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productId(slug: string): string {
  return collectionId("product", slug);
}

export function caseStudyId(slug: string): string {
  return collectionId("caseStudy", slug);
}

export function portfolioId(slug: string): string {
  return collectionId("portfolio", slug);
}

export function teamMemberId(name: string): string {
  return collectionId("teamMember", slugifyName(name));
}

export function serviceCategoryId(slug: string): string {
  return collectionId("serviceCategory", slug);
}

export function serviceId(slug: string): string {
  return collectionId("service", slug);
}

export function communityItemId(slug: string): string {
  return collectionId("communityItem", slug);
}

/** Partner seed ID from placeholder id, e.g. `partner-1` → `partner-partner-1`. */
export function partnerId(placeholderId: string): string {
  return collectionId("partner", placeholderId);
}

export function authorId(slug: string): string {
  return collectionId("author", slug);
}

export function blogCategoryId(slug: string): string {
  return collectionId("category", slug);
}

export function tagId(slug: string): string {
  return collectionId("tag", slug);
}

export function postId(slug: string): string {
  return collectionId("post", slug);
}
