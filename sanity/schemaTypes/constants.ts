/** Expected Sanity document type names (§7 content model). */
export const SANITY_DOCUMENT_TYPES = [
  "siteSettings",
  "homePage",
  "aboutPage",
  "contactPage",
  "teamMember",
  "serviceCategory",
  "service",
  "product",
  "portfolio",
  "caseStudy",
  "communityItem",
  "partner",
  "mediaAsset",
  "author",
  "category",
  "tag",
  "post",
] as const;

export type SanityDocumentType = (typeof SANITY_DOCUMENT_TYPES)[number];

/**
 * Gate 0 — exactly five top-level services (ADR-016).
 * Studio desk opens these by stable `service-{slug}` IDs (seed convention).
 */
export const CANONICAL_SERVICES = [
  {
    order: 1,
    slug: "game-development",
    title: "Game Development",
    documentId: "service-game-development",
  },
  {
    order: 2,
    slug: "product-development",
    title: "Product Development",
    documentId: "service-product-development",
  },
  {
    order: 3,
    slug: "ui-design",
    title: "UI & Design",
    documentId: "service-ui-design",
  },
  {
    order: 4,
    slug: "branding",
    title: "Branding",
    documentId: "service-branding",
  },
  {
    order: 5,
    slug: "community-events",
    title: "Community & Events",
    documentId: "service-community-events",
  },
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICES)[number]["slug"];

export const CANONICAL_SERVICE_SLUGS: readonly CanonicalServiceSlug[] =
  CANONICAL_SERVICES.map((service) => service.slug);

/**
 * Archived document types — kept registered + readOnly so existing
 * documents are never deleted. Desk structure nests these under Archive.
 * `serviceCategory` is obsolete under the flat five-service model (Gate 0).
 */
export const SANITY_ARCHIVED_TYPES = [
  "product",
  "communityItem",
  "caseStudy",
  "serviceCategory",
  "category",
  "tag",
  "author",
  "mediaAsset",
] as const satisfies readonly SanityDocumentType[];

export type SanityArchivedType = (typeof SANITY_ARCHIVED_TYPES)[number];

/** Expected Sanity object type names used in schemas. */
export const SANITY_OBJECT_TYPES = [
  "r2Asset",
  "seoMetadata",
  "cta",
  "socialLink",
  "portableBody",
  "blogBody",
  "storySection",
  "storyTimelineEntry",
  "coreValue",
  "contactChannel",
  "faqItem",
  "productMedia",
  "homeHighlight",
  "hero",
  "mission",
  "featuredWork",
  "highlights",
  "ctaBanner",
] as const;

type SanityObjectType = (typeof SANITY_OBJECT_TYPES)[number];

export const SANITY_SINGLETON_TYPES = [
  "siteSettings",
  "homePage",
  "aboutPage",
  "contactPage",
] as const satisfies readonly SanityDocumentType[];
