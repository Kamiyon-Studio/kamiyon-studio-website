import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { buildMediaPublicUrl } from "@/lib/cms/media";

/**
 * R2 key prefix for the hero parallax plates. The version segment lets a new
 * set of plates ship without waiting out CDN caches on the old keys.
 */
export const HERO_PARALLAX_KEY_PREFIX = "site/hero/parallax/v3";

/**
 * Intrinsic size of the stack. Foreground and ground share this; the video
 * freeze-frame is the same aspect and is cropped by the shared `object-cover`.
 */
export const HERO_PARALLAX_LAYER_WIDTH = 1920;
export const HERO_PARALLAX_LAYER_HEIGHT = 1080;

/** Earth plate used as the Recent Projects section backdrop. */
export const HERO_PARALLAX_BACKGROUND_FILE = "ground.avif";

/** Shared crop so stills and video stay in register. Pin the sky to the viewport top. */
export const HERO_PARALLAX_OBJECT_POSITION = "center top";

/**
 * How far the planted cliff hangs into Recent Projects, in `svh`.
 * Hero padding, the charcoal dissolve, and the projects pull-up stay in lockstep
 * so the fade never washes the first viewport (Trusted By, grass ridge).
 */
export const HERO_PROJECTS_SEAM_SVH = 18;

export type HeroProjectsSeamOverlayStyle = {
  height: string;
  backgroundImage: string;
};

/** Overlay that paints only the hanging soil into `--color-charcoal`. */
export function heroProjectsSeamOverlayStyle(): HeroProjectsSeamOverlayStyle {
  return {
    height: `${HERO_PROJECTS_SEAM_SVH}svh`,
    backgroundImage: `linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-charcoal) 55%, transparent) 45%, var(--color-charcoal) 100%)`,
  };
}

export type HeroParallaxVideoFiles = {
  webm?: string;
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
   * Optional motion plate. The still is the freeze-frame until (or instead of)
   * the video — never a second movie.
   */
  video?: HeroParallaxVideoFiles;
};

export const HERO_PARALLAX_LAYERS: readonly HeroParallaxLayer[] = [
  {
    depth: 1,
    file: "fallback.avif",
    subject: "Sunset landscape video freeze-frame",
    yPercent: 70,
    video: { mp4: "homepage.mp4" },
  },
  {
    depth: 2,
    file: "foreground.avif",
    subject: "Grassy cliff foreground",
    yPercent: 0,
  },
];

/**
 * Travel for the wordmark plate. Sits between the video and the planted
 * foreground so the cliff rises over the wordmark as the hero exits.
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
 * Kept for plates whose video is composited over black. The v3 homepage video
 * is a full opaque scene, so the hero does not apply this mask.
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

  const mp4Src = resolveParallaxFileUrl(video.mp4);
  if (!mp4Src) {
    return {};
  }

  const webmSrc = video.webm ? resolveParallaxFileUrl(video.webm) ?? undefined : undefined;

  return {
    mp4Src,
    ...(webmSrc ? { webmSrc } : {}),
  };
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
