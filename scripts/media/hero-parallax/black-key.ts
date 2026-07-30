/**
 * Alpha keying for the hero parallax plates.
 *
 * The source artwork ships as JPEG, so it has no alpha channel: every plate is
 * already composited over pure black, and the black regions are the parts that
 * should let the plate behind show through. Keying rebuilds an alpha channel
 * from per-pixel coverage so the plates can be stacked.
 */

export type BlackKeyOptions = {
  /** Coverage at or below this stays fully transparent — kills JPEG ringing. */
  floor: number;
  /** Coverage at or above this becomes fully opaque. */
  ceiling: number;
  /**
   * Erosion passes applied to coverage before the ramp. One pass discards the
   * single-pixel rim where artwork fades into the black backing; without it
   * that rim keeps full alpha at a near-black colour and reads as a hard dark
   * outline once the plate sits over a brighter one.
   */
  erodePasses: number;
};

export const DEFAULT_BLACK_KEY_OPTIONS: BlackKeyOptions = {
  floor: 8,
  ceiling: 28,
  erodePasses: 1,
};

export const RGBA_CHANNELS = 4;

/** Hermite ramp between two edges, clamped to 0..1. */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge1 <= edge0) {
    return value >= edge1 ? 1 : 0;
  }

  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Per-pixel coverage of RGBA data — the brightest channel wins.
 *
 * Luminance would under-weight blue, so a dark blue pixel (a genuine part of
 * the artwork) would key out as near-transparent. Max channel keeps saturated
 * dark colours opaque.
 */
export function readCoverage(rgba: Uint8Array, pixelCount: number): Uint8Array {
  const coverage = new Uint8Array(pixelCount);

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * RGBA_CHANNELS;
    const red = rgba[offset] ?? 0;
    const green = rgba[offset + 1] ?? 0;
    const blue = rgba[offset + 2] ?? 0;
    coverage[pixel] = Math.max(red, green, blue);
  }

  return coverage;
}

/** 3x3 minimum filter. Each pass shrinks the opaque region by one pixel. */
export function erodeCoverage(
  coverage: Uint8Array,
  width: number,
  height: number,
  passes: number,
): Uint8Array {
  let current = coverage;

  for (let pass = 0; pass < passes; pass += 1) {
    const next = new Uint8Array(current.length);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let min = 255;

        for (let dy = -1; dy <= 1; dy += 1) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) {
            continue;
          }

          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) {
              continue;
            }

            const value = current[ny * width + nx] ?? 0;
            if (value < min) {
              min = value;
            }
          }
        }

        next[y * width + x] = min;
      }
    }

    current = next;
  }

  return current;
}

/**
 * Returns a new RGBA buffer whose alpha channel is keyed from coverage.
 * Colour channels are copied through untouched, so opaque artwork keeps the
 * exact tones the illustrator authored.
 */
export function keyBlackToAlpha(
  rgba: Uint8Array,
  width: number,
  height: number,
  options: BlackKeyOptions = DEFAULT_BLACK_KEY_OPTIONS,
): Uint8Array {
  const pixelCount = width * height;
  if (rgba.length < pixelCount * RGBA_CHANNELS) {
    throw new Error(
      `Expected at least ${pixelCount * RGBA_CHANNELS} bytes of RGBA for ${width}x${height}, received ${rgba.length}`,
    );
  }

  const coverage = erodeCoverage(
    readCoverage(rgba, pixelCount),
    width,
    height,
    options.erodePasses,
  );

  const keyed = new Uint8Array(rgba);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const ramp = smoothstep(options.floor, options.ceiling, coverage[pixel] ?? 0);
    keyed[pixel * RGBA_CHANNELS + 3] = Math.round(255 * ramp);
  }

  return keyed;
}

/** Share of fully transparent pixels — a cheap sanity check for keyed output. */
export function measureTransparency(rgba: Uint8Array, pixelCount: number): number {
  if (pixelCount <= 0) {
    return 0;
  }

  let clear = 0;
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if ((rgba[pixel * RGBA_CHANNELS + 3] ?? 0) === 0) {
      clear += 1;
    }
  }

  return clear / pixelCount;
}
