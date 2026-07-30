import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { buildMediaPublicUrl } from "@/lib/cms/media";

/**
 * R2 key prefix for the hero parallax plates. The version segment lets a new
 * set of plates ship without waiting out CDN caches on the old keys.
 */
export const HERO_PARALLAX_KEY_PREFIX = "site/hero/parallax/v1";

/**
 * Intrinsic size of every plate. All four share one size on purpose: the layers
 * are cropped identically by `object-cover`, so a mismatch would slide them out
 * of register with each other.
 */
export const HERO_PARALLAX_LAYER_WIDTH = 1024;
export const HERO_PARALLAX_LAYER_HEIGHT = 682;

export type HeroParallaxLayer = {
  /** Depth index, 1 = furthest from the viewer. */
  depth: number;
  /** File name under `HERO_PARALLAX_KEY_PREFIX`. */
  file: string;
  /** Short description of the plate, for maintenance rather than for the DOM. */
  subject: string;
  /**
   * Scrub travel as a percentage of the plate's own height, applied while the
   * hero exits the viewport. Scrolling moves a plate up by the scroll distance,
   * so pushing it *down* cancels part of that: a larger yPercent reads as
   * further away.
   */
  yPercent: number;
};

export const HERO_PARALLAX_LAYERS: readonly HeroParallaxLayer[] = [
  { depth: 1, file: "layer-1.webp", subject: "Sunset sky and far range", yPercent: 70 },
  { depth: 2, file: "layer-2.webp", subject: "Lit ridge and lake", yPercent: 55 },
  { depth: 3, file: "layer-3.webp", subject: "Pagoda hillside", yPercent: 40 },
  { depth: 4, file: "layer-4.webp", subject: "Foreground rocks and foliage", yPercent: 10 },
];

/**
 * Travel for the wordmark plate. Sits between the pagoda hillside and the
 * foreground rocks so the rocks rise over the wordmark as the hero exits.
 */
export const HERO_PARALLAX_BRAND_Y_PERCENT = 25;

export type ResolvedHeroParallaxLayer = HeroParallaxLayer & { src: string };

export function buildHeroParallaxLayerKey(file: string): string {
  return `${HERO_PARALLAX_KEY_PREFIX}/${file}`;
}

/**
 * Resolves every plate to a public media URL usable by `next/image`.
 *
 * Returns null when the media CDN is not configured or any plate resolves to a
 * host `next/image` will reject — callers then fall back to the static hero.
 * All-or-nothing on purpose: a partial stack would render as a broken scene.
 */
export function resolveHeroParallaxLayers(): ResolvedHeroParallaxLayer[] | null {
  const resolved: ResolvedHeroParallaxLayer[] = [];

  for (const layer of HERO_PARALLAX_LAYERS) {
    const src = buildMediaPublicUrl(buildHeroParallaxLayerKey(layer.file));
    if (!src || !isAllowedNextImageSrc(src)) {
      return null;
    }

    resolved.push({ ...layer, src });
  }

  return resolved;
}

/**
 * Splits plates around the wordmark so DOM order gives the right stacking:
 * anything travelling further than the wordmark renders behind it.
 */
export function splitHeroParallaxLayers<T extends HeroParallaxLayer>(
  layers: readonly T[],
): { behindBrand: T[]; inFrontOfBrand: T[] } {
  return {
    behindBrand: layers.filter(
      (layer) => layer.yPercent > HERO_PARALLAX_BRAND_Y_PERCENT,
    ),
    inFrontOfBrand: layers.filter(
      (layer) => layer.yPercent <= HERO_PARALLAX_BRAND_Y_PERCENT,
    ),
  };
}
