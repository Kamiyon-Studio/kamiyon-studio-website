import { describe, expect, it } from "vitest";
import path from "node:path";

import { HERO_PARALLAX_LAYERS } from "@/lib/home/hero-parallax-layers";

import {
  isSupportedSourceFile,
  matchBackgroundSource,
  matchPlateSources,
  matchSourceForDepth,
  matchVideoForDepth,
} from "./plate-sources";

const LEGACY_EXPORTS = [
  "layer-1-7bd06eb8-61ba-45d5-b6bf-8837df430088.png",
  "layer-2-b1a74998-b497-4c88-b2f6-7926d9273710.png",
  "layer-3-fe6c3eca-98ae-45c9-9766-d190293497d9.png",
  "layer-4-847d6099-474f-4ffc-8c98-7bdb4acae240.png",
  "notes.txt",
];

const V3_EXPORTS = [
  "fallback.avif",
  "fallback.png",
  "foreground.avif",
  "foreground.png",
  "ground.avif",
  "ground.png",
  "homepage.mp4",
];

describe("isSupportedSourceFile", () => {
  it("accepts raster exports and rejects everything else", () => {
    expect(isSupportedSourceFile("fallback.AVIF")).toBe(true);
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
    expect(matchSourceForDepth(LEGACY_EXPORTS, 1)).toBe(LEGACY_EXPORTS[0]);
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
    expect(matchSourceForDepth(LEGACY_EXPORTS, 9)).toBeNull();
  });

  it("picks deterministically when several files match", () => {
    const candidates = ["layer-1-b.png", "layer-1-a.png"];
    expect(matchSourceForDepth(candidates, 1)).toBe("layer-1-a.png");
  });

  it("prefers AVIF over WebP over PNG of the same depth", () => {
    expect(
      matchSourceForDepth(
        ["png/layer-1.png", "webp/layer-1.webp", "avif/layer-1.avif"],
        1,
      ),
    ).toBe("avif/layer-1.avif");
  });
});

describe("matchPlateSources", () => {
  it("pairs named v3 stills and attaches the homepage MP4 to the landscape plate", () => {
    const sources = matchPlateSources(V3_EXPORTS, "/exports");

    expect(sources).toHaveLength(HERO_PARALLAX_LAYERS.length);
    expect(sources.map(({ layer }) => layer.depth)).toEqual([1, 2]);
    expect(sources[0]?.sourcePath).toBe(path.join("/exports", "fallback.avif"));
    expect(sources[0]?.pngPath).toBe(path.join("/exports", "fallback.png"));
    expect(sources[0]?.mp4Path).toBe(path.join("/exports", "homepage.mp4"));
    expect(sources[0]?.webmPath).toBeUndefined();
    expect(sources[1]?.sourcePath).toBe(path.join("/exports", "foreground.avif"));
    expect(sources[1]?.pngPath).toBe(path.join("/exports", "foreground.png"));
    expect(sources[1]?.mp4Path).toBeUndefined();
  });

  it("still matches a leftover layer-N pack for the configured depths", () => {
    const sources = matchPlateSources(LEGACY_EXPORTS, "/exports");

    expect(sources).toHaveLength(HERO_PARALLAX_LAYERS.length);
    expect(sources[0]?.sourcePath).toContain(LEGACY_EXPORTS[0]);
    expect(sources[1]?.sourcePath).toContain(LEGACY_EXPORTS[1]);
  });

  it("names the missing depth so the operator knows what to export", () => {
    expect(() => matchPlateSources(["fallback.avif"], "/exports")).toThrow(
      /No source image for layer 2 .* in \/exports/,
    );
  });
});

describe("matchVideoForDepth", () => {
  it("finds WebM and MP4 siblings in format subfolders", () => {
    const files = [
      "webp/layer-1.webp",
      "webm/layer-1.webm",
      "mp4/layer-1.mp4",
      "webm/layer-3.webm",
    ];

    expect(matchVideoForDepth(files, 1, ".webm")).toBe("webm/layer-1.webm");
    expect(matchVideoForDepth(files, 1, ".mp4")).toBe("mp4/layer-1.mp4");
    expect(matchVideoForDepth(files, 3, ".mp4")).toBeNull();
    expect(matchVideoForDepth(files, 2, ".webm")).toBeNull();
  });
});

describe("matchBackgroundSource", () => {
  it("prefers the named ground plate over a leftover background.webp", () => {
    expect(
      matchBackgroundSource([
        "background.webp",
        "ground.png",
        "ground.avif",
        "fallback.avif",
      ]),
    ).toBe("ground.avif");
  });

  it("falls back to a legacy background still", () => {
    expect(
      matchBackgroundSource(["background.png", "background.webp", "webp/layer-1.webp"]),
    ).toBe("background.webp");
  });

  it("returns null when the underlay is missing", () => {
    expect(matchBackgroundSource(["fallback.avif"])).toBeNull();
  });
});
