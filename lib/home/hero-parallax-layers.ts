import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { buildMediaPublicUrl } from "@/lib/cms/media";

/**
 * R2 key prefix for the hero parallax plates. The version segment lets a new
 * set of plates ship without waiting out CDN caches on the old keys.
 */
export const HERO_PARALLAX_KEY_PREFIX = "site/hero/parallax/v2";

/**
 * Intrinsic size of every plate. All four share one size on purpose: the layers
 * are cropped identically by `object-cover`, so a mismatch would slide them out
 * of register with each other.
 */
export const HERO_PARALLAX_LAYER_WIDTH = 1920;
export const HERO_PARALLAX_LAYER_HEIGHT = 1080;

/** Earth cross-section used as the Recent Projects section backdrop. */
export const HERO_PARALLAX_BACKGROUND_FILE = "background.webp";

/** Shared crop so stills, videos, and video masks stay in register. */
export const HERO_PARALLAX_OBJECT_POSITION = "center 62%";

export type HeroParallaxVideoFiles = {
  webm: string;
  mp4: string;
};

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
  /**
   * Optional motion plate. The WebP freeze-frame stays on screen until a
   * browser plays one of these two files — never a third movie.
   */
  video?: HeroParallaxVideoFiles;
};

export const HERO_PARALLAX_LAYERS: readonly HeroParallaxLayer[] = [
  {
    depth: 1,
    file: "layer-1.webp",
    subject: "Color and clouds",
    yPercent: 70,
    video: { webm: "layer-1.webm", mp4: "layer-1.mp4" },
  },
  { depth: 2, file: "layer-2.webp", subject: "Mountain range", yPercent: 55 },
  {
    depth: 3,
    file: "layer-3.webp",
    subject: "Ocean and islets",
    yPercent: 40,
    video: { webm: "layer-3.webm", mp4: "layer-3.mp4" },
  },
  { depth: 4, file: "layer-4.webp", subject: "Foreground rocks and pagoda", yPercent: 0 },
];

/**
 * Travel for the wordmark plate. Sits between the ocean and the foreground so
 * the nearest plate rises over the wordmark as the hero exits.
 */
export const HERO_PARALLAX_BRAND_Y_PERCENT = 25;

export type ResolvedHeroParallaxLayer = HeroParallaxLayer & {
  src: string;
  webmSrc?: string;
  mp4Src?: string;
};

export function buildHeroParallaxLayerKey(file: string): string {
  return `${HERO_PARALLAX_KEY_PREFIX}/${file}`;
}

export type HeroParallaxVideoMaskStyle = {
  maskImage: string;
  WebkitMaskImage: string;
  maskMode: "alpha";
  maskSize: string;
  WebkitMaskSize: string;
  maskPosition: string;
  WebkitMaskPosition: string;
  maskRepeat: string;
  WebkitMaskRepeat: string;
};

/**
 * CSS mask that keeps a motion plate's transparent regions empty.
 *
 * The WebM/MP4 files are composited over black. Without this mask those black
 * pixels sit on top of the sky and mountains. The freeze-frame WebP already has
 * the correct alpha, so it is reused as the mask.
 */
export function heroParallaxVideoMaskStyle(stillSrc: string): HeroParallaxVideoMaskStyle {
  const mask = `url("${stillSrc}")`;

  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskMode: "alpha",
    maskSize: "cover",
    WebkitMaskSize: "cover",
    maskPosition: HERO_PARALLAX_OBJECT_POSITION,
    WebkitMaskPosition: HERO_PARALLAX_OBJECT_POSITION,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}

function resolveParallaxFileUrl(file: string): string | null {
  return buildMediaPublicUrl(buildHeroParallaxLayerKey(file));
}

function resolveVideoUrls(
  video: HeroParallaxVideoFiles | undefined,
): Pick<ResolvedHeroParallaxLayer, "webmSrc" | "mp4Src"> {
  if (!video) {
    return {};
  }

  const webmSrc = resolveParallaxFileUrl(video.webm);
  const mp4Src = resolveParallaxFileUrl(video.mp4);
  if (!webmSrc || !mp4Src) {
    return {};
  }

  return { webmSrc, mp4Src };
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
    const src = resolveParallaxFileUrl(layer.file);
    if (!src || !isAllowedNextImageSrc(src)) {
      return null;
    }

    resolved.push({ ...layer, src, ...resolveVideoUrls(layer.video) });
  }

  return resolved;
}

/**
 * Earth plate for the Recent Projects section. Same host gate as the stills so
 * `next/image` never points at a host it would reject.
 */
export function resolveHomeProjectsBackground(): string | null {
  const src = resolveParallaxFileUrl(HERO_PARALLAX_BACKGROUND_FILE);
  if (!src || !isAllowedNextImageSrc(src)) {
    return null;
  }

  return src;
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
