import { describe, expect, it } from "vitest";

import {
  DEFAULT_BLACK_KEY_OPTIONS,
  erodeCoverage,
  keyBlackToAlpha,
  measureTransparency,
  readCoverage,
  smoothstep,
  RGBA_CHANNELS,
} from "./black-key";

/** Builds an RGBA buffer from a grid of `[r, g, b]` rows. */
function rgbaFrom(rows: readonly (readonly [number, number, number])[][]): {
  data: Uint8Array;
  width: number;
  height: number;
} {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const data = new Uint8Array(width * height * RGBA_CHANNELS);

  rows.forEach((row, y) => {
    row.forEach(([r, g, b], x) => {
      const offset = (y * width + x) * RGBA_CHANNELS;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255;
    });
  });

  return { data, width, height };
}

function alphaAt(rgba: Uint8Array, width: number, x: number, y: number): number {
  return rgba[(y * width + x) * RGBA_CHANNELS + 3] ?? 0;
}

const BLACK = [0, 0, 0] as const;
const OPAQUE = [160, 70, 76] as const;

describe("smoothstep", () => {
  it("clamps below the first edge and above the second", () => {
    expect(smoothstep(8, 28, 0)).toBe(0);
    expect(smoothstep(8, 28, 8)).toBe(0);
    expect(smoothstep(8, 28, 28)).toBe(1);
    expect(smoothstep(8, 28, 255)).toBe(1);
  });

  it("eases through the midpoint rather than ramping linearly", () => {
    expect(smoothstep(0, 10, 5)).toBeCloseTo(0.5, 5);
    expect(smoothstep(0, 10, 2)).toBeLessThan(0.2);
    expect(smoothstep(0, 10, 8)).toBeGreaterThan(0.8);
  });

  it("degrades to a hard step when the edges collapse", () => {
    expect(smoothstep(12, 12, 11)).toBe(0);
    expect(smoothstep(12, 12, 12)).toBe(1);
  });
});

describe("readCoverage", () => {
  it("takes the brightest channel so saturated dark colours stay covered", () => {
    const { data, width, height } = rgbaFrom([[BLACK, [0, 0, 80], [12, 4, 6]]]);

    expect(Array.from(readCoverage(data, width * height))).toEqual([0, 80, 12]);
  });
});

describe("erodeCoverage", () => {
  it("returns coverage untouched when no passes are requested", () => {
    const coverage = new Uint8Array([0, 255, 255, 255, 255, 255, 255, 255, 255]);

    expect(Array.from(erodeCoverage(coverage, 3, 3, 0))).toEqual(
      Array.from(coverage),
    );
  });

  it("shrinks an opaque region by one pixel per pass", () => {
    // 5x5 fully opaque except nothing — one black corner pulls neighbours down.
    const coverage = new Uint8Array(25).fill(255);
    coverage[0] = 0;

    const once = erodeCoverage(coverage, 5, 5, 1);
    expect(once[0]).toBe(0);
    expect(once[1]).toBe(0);
    expect(once[5]).toBe(0);
    expect(once[6]).toBe(0);
    expect(once[7]).toBe(255);

    const twice = erodeCoverage(coverage, 5, 5, 2);
    expect(twice[7]).toBe(0);
    expect(twice[12]).toBe(0);
    expect(twice[18]).toBe(255);
  });

  it("does not read across row boundaries", () => {
    const coverage = new Uint8Array([255, 255, 0, 255, 255, 255]);
    const eroded = erodeCoverage(coverage, 3, 2, 1);

    // Index 3 starts the second row; it neighbours indexes 0/1 and 4, not 2.
    expect(eroded[3]).toBe(255);
    expect(eroded[4]).toBe(0);
  });
});

describe("keyBlackToAlpha", () => {
  it("keys black regions transparent and keeps artwork opaque", () => {
    const { data, width, height } = rgbaFrom([
      [BLACK, BLACK, BLACK, BLACK, BLACK],
      [BLACK, OPAQUE, OPAQUE, OPAQUE, BLACK],
      [BLACK, OPAQUE, OPAQUE, OPAQUE, BLACK],
      [BLACK, OPAQUE, OPAQUE, OPAQUE, BLACK],
      [BLACK, BLACK, BLACK, BLACK, BLACK],
    ]);

    const keyed = keyBlackToAlpha(data, width, height);

    expect(alphaAt(keyed, width, 0, 0)).toBe(0);
    expect(alphaAt(keyed, width, 2, 2)).toBe(255);
  });

  it("erodes the premultiplied rim so it cannot composite as a dark outline", () => {
    // The rim pixel is dim artwork sitting between black backing and full art.
    const rim = [40, 16, 18] as const;
    const { data, width, height } = rgbaFrom([
      [BLACK, BLACK, BLACK, BLACK, BLACK],
      [BLACK, rim, rim, rim, BLACK],
      [BLACK, rim, OPAQUE, rim, BLACK],
      [BLACK, rim, rim, rim, BLACK],
      [BLACK, BLACK, BLACK, BLACK, BLACK],
    ]);

    const keyed = keyBlackToAlpha(data, width, height);
    expect(alphaAt(keyed, width, 1, 1)).toBe(0);

    const unkeyed = keyBlackToAlpha(data, width, height, {
      ...DEFAULT_BLACK_KEY_OPTIONS,
      erodePasses: 0,
    });
    expect(alphaAt(unkeyed, width, 1, 1)).toBe(255);
  });

  it("leaves colour channels untouched", () => {
    const { data, width, height } = rgbaFrom([[OPAQUE, BLACK]]);
    const keyed = keyBlackToAlpha(data, width, height, {
      ...DEFAULT_BLACK_KEY_OPTIONS,
      erodePasses: 0,
    });

    expect(Array.from(keyed.slice(0, 3))).toEqual(Array.from(OPAQUE));
  });

  it("does not mutate the source buffer", () => {
    const { data, width, height } = rgbaFrom([[BLACK, OPAQUE]]);
    const before = Array.from(data);

    keyBlackToAlpha(data, width, height);

    expect(Array.from(data)).toEqual(before);
  });

  it("rejects a buffer that is too small for the stated dimensions", () => {
    expect(() => keyBlackToAlpha(new Uint8Array(8), 4, 4)).toThrow(
      /Expected at least 64 bytes/,
    );
  });
});

describe("measureTransparency", () => {
  it("reports the share of fully transparent pixels", () => {
    const { data, width, height } = rgbaFrom([
      [BLACK, BLACK, OPAQUE, OPAQUE],
    ]);

    const keyed = keyBlackToAlpha(data, width, height, {
      ...DEFAULT_BLACK_KEY_OPTIONS,
      erodePasses: 0,
    });

    expect(measureTransparency(keyed, width * height)).toBeCloseTo(0.5, 5);
  });

  it("returns zero for an empty image", () => {
    expect(measureTransparency(new Uint8Array(0), 0)).toBe(0);
  });
});
