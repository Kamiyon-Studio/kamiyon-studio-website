import { PRODUCTION_CANONICAL_ORIGIN } from "./site-url";

/** Core public URLs for local SEO checks and Search Console inspection. */
export const IMPORTANT_PATHS = [
  "/",
  "/about",
  "/services",
  "/services/game-development",
  "/services/product-development",
  "/services/ui-design",
  "/services/branding",
  "/services/community-events",
  "/portfolio",
  "/contact",
  "/blog",
] as const;

export function importantAbsoluteUrls(
  origin: string = PRODUCTION_CANONICAL_ORIGIN,
): string[] {
  const base = origin.replace(/\/+$/, "");
  return IMPORTANT_PATHS.map((path) =>
    path === "/" ? base : `${base}${path}`,
  );
}
