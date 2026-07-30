import { describe, expect, it } from "vitest";

import { HERO_PARALLAX_LAYERS } from "@/lib/home/hero-parallax-layers";

import {
  isSupportedSourceFile,
  matchPlateSources,
  matchSourceForDepth,
} from "./plate-sources";

const EXPORTS = [
  "layer-1-7bd06eb8-61ba-45d5-b6bf-8837df430088.png",
  "layer-2-b1a74998-b497-4c88-b2f6-7926d9273710.png",
  "layer-3-fe6c3eca-98ae-45c9-9766-d190293497d9.png",
  "layer-4-847d6099-474f-4ffc-8c98-7bdb4acae240.png",
  "notes.txt",
];

describe("isSupportedSourceFile", () => {
  it("accepts raster exports and rejects everything else", () => {
    expect(isSupportedSourceFile("layer-1.JPG")).toBe(true);
    expect(isSupportedSourceFile("layer-1.jpeg")).toBe(true);
    expect(isSupportedSourceFile("layer-1.png")).toBe(true);
    expect(isSupportedSourceFile("layer-1.webp")).toBe(true);
    expect(isSupportedSourceFile("layer-1.psd")).toBe(false);
    expect(isSupportedSourceFile("layer-1")).toBe(false);
  });
});

describe("matchSourceForDepth", () => {
  it("matches a depth regardless of the suffix the export tool added", () => {
    expect(matchSourceForDepth(EXPORTS, 3)).toBe(EXPORTS[2]);
  });

  it("accepts underscore, space, and bare separators", () => {
    expect(matchSourceForDepth(["layer_2.png"], 2)).toBe("layer_2.png");
    expect(matchSourceForDepth(["layer 2.png"], 2)).toBe("layer 2.png");
    expect(matchSourceForDepth(["layer2.png"], 2)).toBe("layer2.png");
  });

  it("does not confuse layer 1 with layer 10", () => {
    expect(matchSourceForDepth(["layer-10.png"], 1)).toBeNull();
    expect(matchSourceForDepth(["layer-10.png", "layer-1.png"], 1)).toBe(
      "layer-1.png",
    );
  });

  it("ignores non-image files that happen to mention a layer", () => {
    expect(matchSourceForDepth(["layer-1-notes.txt"], 1)).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(matchSourceForDepth(EXPORTS, 9)).toBeNull();
  });

  it("picks deterministically when several files match", () => {
    const candidates = ["layer-1-b.png", "layer-1-a.png"];
    expect(matchSourceForDepth(candidates, 1)).toBe("layer-1-a.png");
  });
});

describe("matchPlateSources", () => {
  it("pairs every configured plate with its export in depth order", () => {
    const sources = matchPlateSources(EXPORTS, "/exports");

    expect(sources).toHaveLength(HERO_PARALLAX_LAYERS.length);
    expect(sources.map(({ layer }) => layer.depth)).toEqual([1, 2, 3, 4]);
    expect(sources[0]?.sourcePath).toContain(EXPORTS[0]);
  });

  it("names the missing depth so the operator knows what to export", () => {
    expect(() => matchPlateSources(["layer-1.png"], "/exports")).toThrow(
      /No source image for layer 2 .* in \/exports/,
    );
  });
});
