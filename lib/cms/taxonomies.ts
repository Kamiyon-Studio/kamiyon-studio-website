/**
 * Shared taxonomy constants — Studio `options.list` + app title lookups.
 *
 * Service values follow Gate 0 / ADR-016 (five flat offerings).
 * Blog categories/tags remain from seed-data.blog stubs.
 */

export type TaxonomyOption = {
  value: string;
  title: string;
  description?: string;
};

/** Gate 0 five services — also used as portfolio.serviceType options. */
export const SERVICE_CATEGORIES = [
  {
    value: "game-development",
    title: "Game Development",
    description:
      "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
  },
  {
    value: "product-development",
    title: "Product Development",
    description:
      "We design and build digital products that solve real-world problems. From startup MVPs to internal platforms, we help organizations launch products that are functional, scalable, and user-focused.",
  },
  {
    value: "ui-design",
    title: "UI & Design",
    description:
      "We create intuitive interfaces and visually compelling assets that elevate products, games, and brands through thoughtful design and user-centered experiences.",
  },
  {
    value: "branding",
    title: "Branding",
    description:
      "A strong brand is more than a logo. We help organizations create cohesive visual identities that communicate their story consistently across every touchpoint.",
  },
  {
    value: "community-events",
    title: "Community & Events",
    description:
      "We help organizations foster thriving developer, gaming, and technology communities through engaging programs and collaborative events that create lasting impact.",
  },
] as const satisfies readonly TaxonomyOption[];

export const POST_CATEGORIES = [
  {
    value: "updates",
    title: "Updates",
  },
] as const satisfies readonly TaxonomyOption[];

export const POST_TAGS = [
  {
    value: "coming-soon",
    title: "Coming soon",
  },
  {
    value: "announcement",
    title: "Announcement",
  },
] as const satisfies readonly TaxonomyOption[];

export const PORTFOLIO_PROJECT_TYPES = [
  {
    value: "original-ip",
    title: "Original IP",
  },
  {
    value: "client-work",
    title: "Client work",
  },
] as const satisfies readonly TaxonomyOption[];

export const PORTFOLIO_STATUSES = [
  { value: "prototype", title: "Prototype" },
  { value: "in-development", title: "In development" },
  { value: "released", title: "Released" },
  { value: "archived", title: "Archived" },
] as const satisfies readonly TaxonomyOption[];

export const PORTFOLIO_LINK_KINDS = [
  { value: "website", title: "Website" },
  { value: "trailer", title: "Trailer" },
  { value: "store", title: "Store" },
  { value: "press", title: "Press" },
  { value: "source", title: "Source" },
  { value: "other", title: "Other" },
] as const satisfies readonly TaxonomyOption[];

export type ServiceCategoryValue = (typeof SERVICE_CATEGORIES)[number]["value"];
export type PostCategoryValue = (typeof POST_CATEGORIES)[number]["value"];
export type PostTagValue = (typeof POST_TAGS)[number]["value"];
export type PortfolioProjectTypeValue =
  (typeof PORTFOLIO_PROJECT_TYPES)[number]["value"];
export type PortfolioStatusValue = (typeof PORTFOLIO_STATUSES)[number]["value"];
export type PortfolioLinkKindValue = (typeof PORTFOLIO_LINK_KINDS)[number]["value"];

/** Sanity `options.list` shape: `{ title, value }[]`. */
export function toSanityListOptions(
  options: readonly TaxonomyOption[]
): Array<{ title: string; value: string }> {
  return options.map(({ title, value }) => ({ title, value }));
}

export function findTaxonomyTitle(
  options: readonly TaxonomyOption[],
  value: string
): string | undefined {
  return options.find((option) => option.value === value)?.title;
}

export function isServiceCategoryValue(
  value: string
): value is ServiceCategoryValue {
  return SERVICE_CATEGORIES.some((option) => option.value === value);
}

export function isPostCategoryValue(value: string): value is PostCategoryValue {
  return POST_CATEGORIES.some((option) => option.value === value);
}

export function isPostTagValue(value: string): value is PostTagValue {
  return POST_TAGS.some((option) => option.value === value);
}

export function isPortfolioProjectType(
  value: string,
): value is PortfolioProjectTypeValue {
  return PORTFOLIO_PROJECT_TYPES.some((option) => option.value === value);
}

export function isPortfolioStatus(value: string): value is PortfolioStatusValue {
  return PORTFOLIO_STATUSES.some((option) => option.value === value);
}

export function isPortfolioLinkKind(
  value: string,
): value is PortfolioLinkKindValue {
  return PORTFOLIO_LINK_KINDS.some((option) => option.value === value);
}
