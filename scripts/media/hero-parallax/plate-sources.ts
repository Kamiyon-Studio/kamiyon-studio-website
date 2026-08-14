import { readdir } from "node:fs/promises";
import path from "node:path";

import {
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
};

/** Raw exports arrive with tool-generated suffixes, so match loosely on depth. */
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function isSupportedSourceFile(fileName: string): boolean {
  return SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
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

/**
 * Finds the export for one depth by looking for `layer-<depth>` anywhere in the
 * file name, so downloaded copies keep working with their hash suffixes.
 * Prefers a WebP freeze-frame when PNG and WebP both exist.
 */
export function matchSourceForDepth(
  fileNames: readonly string[],
  depth: number,
): string | null {
  const matches = sortedMatches(
    fileNames,
    (name) => isSupportedSourceFile(name) && matchesDepth(name, depth),
  );
  const webp = matches.filter((name) => path.extname(name).toLowerCase() === ".webp");

  return webp[0] ?? matches[0] ?? null;
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

function matchPngForDepth(
  fileNames: readonly string[],
  depth: number,
): string | null {
  return (
    sortedMatches(
      fileNames,
      (name) =>
        path.extname(name).toLowerCase() === ".png" && matchesDepth(name, depth),
    )[0] ?? null
  );
}

/** Prefers the WebP earth underlay when both PNG and WebP are present. */
export function matchBackgroundSource(fileNames: readonly string[]): string | null {
  const matches = fileNames.filter((name) => {
    const base = path.basename(name).toLowerCase();
    return base === "background.webp" || base === "background.png";
  });

  matches.sort((left, right) => {
    const leftRank = path.extname(left).toLowerCase() === ".webp" ? 0 : 1;
    const rightRank = path.extname(right).toLowerCase() === ".webp" ? 0 : 1;
    return leftRank - rightRank || left.localeCompare(right);
  });

  return matches[0] ?? null;
}

/** Pairs every configured plate with its export, or explains what is missing. */
export function matchPlateSources(
  fileNames: readonly string[],
  sourceDir: string,
): PlateSource[] {
  return HERO_PARALLAX_LAYERS.map((layer) => {
    const match = matchSourceForDepth(fileNames, layer.depth);
    if (!match) {
      throw new Error(
        `No source image for layer ${layer.depth} (${layer.subject}) in ${sourceDir}. Expected a file name containing "layer-${layer.depth}".`,
      );
    }

    const png = matchPngForDepth(fileNames, layer.depth);
    const webm = matchVideoForDepth(fileNames, layer.depth, ".webm");
    const mp4 = matchVideoForDepth(fileNames, layer.depth, ".mp4");

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

  return {
    plates: matchPlateSources(fileNames, sourceDir),
    backgroundPath: background ? path.join(sourceDir, background) : null,
  };
}
