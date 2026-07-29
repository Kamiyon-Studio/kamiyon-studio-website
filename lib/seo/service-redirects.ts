/**
 * Gate 0 / ADR-016 service path redirects (incl. Gate 1 live fold-in).
 * Source: context/gate0-services-taxonomy.md §4 — do not invent beyond that list.
 *
 * Consumed by `next.config.ts` `redirects()`. Permanent → HTTP 308.
 */

export type ServicePathRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

/** Old `/services/[slug]` → destination. Canonical five have no entries. */
export const SERVICE_PATH_REDIRECTS = {
  "/services/mvp-development": "/services/product-development",
  "/services/web-development": "/services/product-development",
  "/services/mobile-development": "/services/product-development",
  "/services/ai-integration": "/services/product-development",
  "/services/gamification": "/services/game-development",
  "/services/ui-ux-design": "/services/ui-design",
  "/services/creative-services": "/services",
  "/services/blockchain-solutions": "/services",
  "/services/consultation": "/services",
  "/services/community-growth-management": "/services/community-events",
  "/services/creative-direction-branding": "/services/branding",
  "/services/game-dev": "/services/game-development",
} as const satisfies Record<string, string>;

export function buildServiceRedirects(): ServicePathRedirect[] {
  return Object.entries(SERVICE_PATH_REDIRECTS).map(
    ([source, destination]) => ({
      source,
      destination,
      permanent: true as const,
    })
  );
}
