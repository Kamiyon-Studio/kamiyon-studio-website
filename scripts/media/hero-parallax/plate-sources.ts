import { readdir } from "node:fs/promises";
import path from "node:path";

import {
  HERO_PARALLAX_BACKGROUND_FILE,
  HERO_PARALLAX_LAYERS,
  type HeroParallaxLayer,
} from "@/lib/home/hero-parallax-layers";

export type PlateSource = {
  layer: HeroParallaxLayer;
  sourcePath: string;
  pngPath?: string;
  webmPath?: string;
  mp4Path?: string;
};

export type ResolvedParallaxSources = {
  plates: PlateSource[];
  backgroundPath: string | null;
  backgroundPngPath: string | null;
};

const STILL_RANK: Record<string, number> = {
  ".avif": 0,
  ".webp": 1,
  ".png": 2,
  ".jpg": 3,
  ".jpeg": 3,
};

/** Raw exports arrive with tool-generated suffixes, so match loosely on depth. */
const SOURCE_EXTENSIONS = new Set(Object.keys(STILL_RANK));

export function isSupportedSourceFile(fileName: string): boolean {
  return SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function stemOf(fileName: string): string {
  return path.basename(fileName, path.extname(fileName)).toLowerCase();
}

function stillRank(fileName: string): number {
  return STILL_RANK[path.extname(fileName).toLowerCase()] ?? 99;
}

function pickPreferredStill(matches: readonly string[]): string | null {
  const ranked = [...matches].sort(
    (left, right) => stillRank(left) - stillRank(right) || left.localeCompare(right),
  );
  return ranked[0] ?? null;
}

function depthPattern(depth: number): RegExp {
  return new RegExp(`layer[-_ ]?${depth}(?!\\d)`, "i");
}

function matchesDepth(fileName: string, depth: number): boolean {
  return depthPattern(depth).test(path.basename(fileName));
}

function sortedMatches(
  fileNames: readonly string[],
  predicate: (name: string) => boolean,
): string[] {
  return fileNames.filter(predicate).sort();
}

function matchStillByStem(
  fileNames: readonly string[],
  stem: string,
): string | null {
  const needle = stem.toLowerCase();
  return pickPreferredStill(
    fileNames.filter(
      (name) => isSupportedSourceFile(name) && stemOf(name) === needle,
    ),
  );
}

function matchPngByStem(
  fileNames: readonly string[],
  stem: string,
): string | null {
  const needle = stem.toLowerCase();
  return (
    sortedMatches(
      fileNames,
      (name) =>
        path.extname(name).toLowerCase() === ".png" && stemOf(name) === needle,
    )[0] ?? null
  );
}

/**
 * Finds the export for one depth by looking for `layer-<depth>` anywhere in the
 * file name, so downloaded copies keep working with their hash suffixes.
 * Prefers AVIF, then WebP, then PNG.
 */
export function matchSourceForDepth(
  fileNames: readonly string[],
  depth: number,
): string | null {
  return pickPreferredStill(
    fileNames.filter(
      (name) => isSupportedSourceFile(name) && matchesDepth(name, depth),
    ),
  );
}

export function matchVideoForDepth(
  fileNames: readonly string[],
  depth: number,
  extension: ".webm" | ".mp4",
): string | null {
  return (
    sortedMatches(
      fileNames,
      (name) =>
        path.extname(name).toLowerCase() === extension && matchesDepth(name, depth),
    )[0] ?? null
  );
}

function matchVideoByFileName(
  fileNames: readonly string[],
  fileName: string | undefined,
): string | null {
  if (!fileName) {
    return null;
  }

  const needle = fileName.toLowerCase();
  return (
    sortedMatches(
      fileNames,
      (name) => path.basename(name).toLowerCase() === needle,
    )[0] ?? null
  );
}

function configuredStem(fileName: string): string {
  return path.basename(fileName, path.extname(fileName));
}

function matchSourceForLayer(
  fileNames: readonly string[],
  layer: HeroParallaxLayer,
): string | null {
  return (
    matchStillByStem(fileNames, configuredStem(layer.file)) ??
    matchSourceForDepth(fileNames, layer.depth)
  );
}

function matchPngForLayer(
  fileNames: readonly string[],
  layer: HeroParallaxLayer,
): string | null {
  return (
    matchPngByStem(fileNames, configuredStem(layer.file)) ??
    sortedMatches(
      fileNames,
      (name) =>
        path.extname(name).toLowerCase() === ".png" && matchesDepth(name, layer.depth),
    )[0] ??
    null
  );
}

function matchVideoForLayer(
  fileNames: readonly string[],
  layer: HeroParallaxLayer,
  extension: ".webm" | ".mp4",
): string | null {
  const configured = extension === ".mp4" ? layer.video?.mp4 : layer.video?.webm;
  return (
    matchVideoByFileName(fileNames, configured) ??
    matchVideoForDepth(fileNames, layer.depth, extension)
  );
}

/** Prefers `ground.avif` (or WebP/PNG of that stem), then a leftover `background.*`. */
export function matchBackgroundSource(fileNames: readonly string[]): string | null {
  const named = matchStillByStem(
    fileNames,
    configuredStem(HERO_PARALLAX_BACKGROUND_FILE),
  );
  if (named) {
    return named;
  }

  return pickPreferredStill(
    fileNames.filter((name) => {
      const base = path.basename(name).toLowerCase();
      return (
        base === "background.avif" ||
        base === "background.webp" ||
        base === "background.png"
      );
    }),
  );
}

/** Pairs every configured plate with its export, or explains what is missing. */
export function matchPlateSources(
  fileNames: readonly string[],
  sourceDir: string,
): PlateSource[] {
  return HERO_PARALLAX_LAYERS.map((layer) => {
    const match = matchSourceForLayer(fileNames, layer);
    if (!match) {
      throw new Error(
        `No source image for layer ${layer.depth} (${layer.subject}) in ${sourceDir}. Expected "${layer.file}" or a file name containing "layer-${layer.depth}".`,
      );
    }

    const png = matchPngForLayer(fileNames, layer);
    const webm = matchVideoForLayer(fileNames, layer, ".webm");
    const mp4 = matchVideoForLayer(fileNames, layer, ".mp4");

    return {
      layer,
      sourcePath: path.join(sourceDir, match),
      ...(png ? { pngPath: path.join(sourceDir, png) } : {}),
      ...(webm ? { webmPath: path.join(sourceDir, webm) } : {}),
      ...(mp4 ? { mp4Path: path.join(sourceDir, mp4) } : {}),
    };
  });
}

/** One-level walk so `webp/`, `webm/`, `mp4/`, and `png/` exports all match. */
export async function listSourceFiles(sourceDir: string): Promise<string[]> {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(entry.name);
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    const nested = await readdir(path.join(sourceDir, entry.name), {
      withFileTypes: true,
    });
    for (const child of nested) {
      if (child.isFile()) {
        files.push(path.join(entry.name, child.name));
      }
    }
  }

  return files;
}

export async function resolvePlateSources(sourceDir: string): Promise<PlateSource[]> {
  return matchPlateSources(await listSourceFiles(sourceDir), sourceDir);
}

export async function resolveParallaxSources(
  sourceDir: string,
): Promise<ResolvedParallaxSources> {
  const fileNames = await listSourceFiles(sourceDir);
  const background = matchBackgroundSource(fileNames);
  const backgroundPng = matchPngByStem(
    fileNames,
    configuredStem(HERO_PARALLAX_BACKGROUND_FILE),
  );

  return {
    plates: matchPlateSources(fileNames, sourceDir),
    backgroundPath: background ? path.join(sourceDir, background) : null,
    backgroundPngPath: backgroundPng ? path.join(sourceDir, backgroundPng) : null,
  };
}
