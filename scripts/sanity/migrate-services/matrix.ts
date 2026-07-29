/**
 * Remap matrix for WS-C five-service migration.
 *
 * Base rows: Gate 0 (`context/gate0-services-taxonomy.md` §3).
 * Live extensions: human-approved 2026-07-29 for UUID docs found in dataset
 * `kamiyon` that were outside the Gate 0 seed inventory — do not invent further
 * assignments; STOP if new unknown slugs appear.
 */

export type RemapKind = "keep" | "merge" | "rename" | "delete" | "create";

export type OldServiceRemap = {
  oldSlug: string;
  action: Exclude<RemapKind, "create">;
  /** Present for keep / merge / rename */
  newSlug?: string;
};

/** Fixed five-service taxonomy (order 1–5). */
export const TARGET_SERVICES = [
  {
    slug: "game-development",
    title: "Game Development",
    order: 1,
    tagline: "Build immersive games that inspire, educate, and entertain.",
  },
  {
    slug: "product-development",
    title: "Product Development",
    order: 2,
    tagline: "Transform ideas into modern digital products.",
  },
  {
    slug: "ui-design",
    title: "UI & Design",
    order: 3,
    tagline: "Design experiences people love to use.",
  },
  {
    slug: "branding",
    title: "Branding",
    order: 4,
    tagline: "Build memorable brands with purpose.",
  },
  {
    slug: "community-events",
    title: "Community & Events",
    order: 5,
    tagline: "Grow communities through meaningful experiences.",
  },
] as const;

export type TargetServiceSlug = (typeof TARGET_SERVICES)[number]["slug"];

export const TARGET_SLUGS: ReadonlySet<string> = new Set(
  TARGET_SERVICES.map((s) => s.slug),
);

/**
 * Gate 0 seed remap (old → new), excluding pure creates.
 * Creates for product-development / branding / community-events /
 * ui-design (via rename) are derived by the planner.
 */
export const GATE0_SERVICE_REMAP: readonly OldServiceRemap[] = [
  { oldSlug: "game-development", action: "keep", newSlug: "game-development" },
  { oldSlug: "mvp-development", action: "merge", newSlug: "product-development" },
  { oldSlug: "web-development", action: "merge", newSlug: "product-development" },
  { oldSlug: "mobile-development", action: "merge", newSlug: "product-development" },
  { oldSlug: "ai-integration", action: "merge", newSlug: "product-development" },
  { oldSlug: "gamification", action: "merge", newSlug: "game-development" },
  { oldSlug: "ui-ux-design", action: "rename", newSlug: "ui-design" },
  { oldSlug: "creative-services", action: "delete" },
  { oldSlug: "blockchain-solutions", action: "delete" },
  { oldSlug: "consultation", action: "delete" },
] as const;

/**
 * Human-approved live dataset extensions (2026-07-29).
 * UUID-backed docs discovered in `kamiyon` outside Gate 0 seed inventory.
 */
export const LIVE_SERVICE_REMAP_EXTENSIONS: readonly OldServiceRemap[] = [
  {
    oldSlug: "community-growth-management",
    action: "merge",
    newSlug: "community-events",
  },
  {
    oldSlug: "creative-direction-branding",
    action: "merge",
    newSlug: "branding",
  },
  { oldSlug: "game-dev", action: "merge", newSlug: "game-development" },
] as const;

/** Full service remap = Gate 0 + approved live extensions. */
export const OLD_SERVICE_REMAP: readonly OldServiceRemap[] = [
  ...GATE0_SERVICE_REMAP,
  ...LIVE_SERVICE_REMAP_EXTENSIONS,
];

export const KNOWN_OLD_SLUGS: ReadonlySet<string> = new Set(
  OLD_SERVICE_REMAP.map((r) => r.oldSlug),
);

/** Slugs that may appear post-migration or as create targets. */
export const KNOWN_SERVICE_SLUGS: ReadonlySet<string> = new Set([
  ...KNOWN_OLD_SLUGS,
  ...TARGET_SLUGS,
]);

export const GATE0_CATEGORY_SLUGS_TO_DELETE = [
  "interactive-experience-development",
  "software-development",
  "creative-design-services",
  "consulting-technical-advisory",
] as const;

/**
 * Extra live categories (2026-07-29) — delete with Gate 0 ×4.
 * Integrator may fold these into gate0 artifact at Gate 1.
 */
export const LIVE_CATEGORY_SLUGS_TO_DELETE = [
  "community-building",
  "creative-direction",
  "game-development",
] as const;

export const CATEGORY_SLUGS_TO_DELETE = [
  ...GATE0_CATEGORY_SLUGS_TO_DELETE,
  ...LIVE_CATEGORY_SLUGS_TO_DELETE,
] as const;

export const KNOWN_CATEGORY_SLUGS: ReadonlySet<string> = new Set(
  CATEGORY_SLUGS_TO_DELETE,
);

export const CREATE_SLUGS: readonly TargetServiceSlug[] = [
  "product-development",
  "branding",
  "community-events",
] as const;

export function serviceDocId(slug: string): string {
  return `service-${slug}`;
}

export function serviceCategoryDocId(slug: string): string {
  return `serviceCategory-${slug}`;
}

export function remapForSlug(slug: string): OldServiceRemap | undefined {
  return OLD_SERVICE_REMAP.find((r) => r.oldSlug === slug);
}

/** Resolve where an old service slug should point after migration. */
export function resolveTargetSlug(oldSlug: string): string | null {
  const row = remapForSlug(oldSlug);
  if (!row) {
    if (TARGET_SLUGS.has(oldSlug)) {
      return oldSlug;
    }
    return null;
  }
  if (row.action === "delete") {
    return null;
  }
  return row.newSlug ?? null;
}
