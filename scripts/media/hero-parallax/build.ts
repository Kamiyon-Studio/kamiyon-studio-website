import sharp from "sharp";

import {
  HERO_PARALLAX_LAYER_HEIGHT,
  HERO_PARALLAX_LAYER_WIDTH,
} from "@/lib/home/hero-parallax-layers";

import {
  DEFAULT_BLACK_KEY_OPTIONS,
  keyBlackToAlpha,
  measureTransparency,
  type BlackKeyOptions,
} from "./black-key";
import type { PlateSource } from "./plate-sources";

/** Dark, gradient-heavy art hides WebP artefacts well, so 82 is plenty. */
const WEBP_QUALITY = 82;
const WEBP_EFFORT = 6;

export type BuiltPlate = PlateSource & {
  webp: Buffer;
  transparency: number;
  /**
   * Format sharp actually decoded. The raw exports are often mis-suffixed, so
   * this is what the archived copy should be named and served as.
   */
  sourceFormat: string;
};

/**
 * Keys one plate to WebP with alpha.
 *
 * Every plate is resized to the configured geometry rather than trusting the
 * export: the stack is cropped by a shared `object-cover`, so a plate at a
 * different size would drift out of register with its neighbours.
 */
export async function buildPlate(
  source: PlateSource,
  options: BlackKeyOptions = DEFAULT_BLACK_KEY_OPTIONS,
): Promise<BuiltPlate> {
  const { format } = await sharp(source.sourcePath).metadata();

  const { data, info } = await sharp(source.sourcePath)
    .resize(HERO_PARALLAX_LAYER_WIDTH, HERO_PARALLAX_LAYER_HEIGHT, { fit: "cover" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const keyed = keyBlackToAlpha(data, info.width, info.height, options);

  const webp = await sharp(keyed, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT, alphaQuality: 100 })
    .toBuffer();

  return {
    ...source,
    webp,
    transparency: measureTransparency(keyed, info.width * info.height),
    sourceFormat: format ?? "jpeg",
  };
}

/** Flattens the keyed stack back down, for eyeballing the composite locally. */
export async function renderStackPreview(
  plates: readonly BuiltPlate[],
): Promise<Buffer> {
  const ordered = [...plates].sort((a, b) => a.layer.depth - b.layer.depth);
  const [base, ...rest] = ordered;

  if (!base) {
    throw new Error("Cannot preview an empty plate stack");
  }

  return sharp(base.webp)
    .composite(rest.map((plate) => ({ input: plate.webp, blend: "over" })))
    .jpeg({ quality: 90 })
    .toBuffer();
}
