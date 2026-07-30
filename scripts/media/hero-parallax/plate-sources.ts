import { readdir } from "node:fs/promises";
import path from "node:path";

import {
  HERO_PARALLAX_LAYERS,
  type HeroParallaxLayer,
} from "@/lib/home/hero-parallax-layers";

export type PlateSource = {
  layer: HeroParallaxLayer;
  sourcePath: string;
};

/** Raw exports arrive with tool-generated suffixes, so match loosely on depth. */
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function isSupportedSourceFile(fileName: string): boolean {
  return SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

/**
 * Finds the export for one depth by looking for `layer-<depth>` anywhere in the
 * file name, so downloaded copies keep working with their hash suffixes.
 */
export function matchSourceForDepth(
  fileNames: readonly string[],
  depth: number,
): string | null {
  const pattern = new RegExp(`layer[-_ ]?${depth}(?!\\d)`, "i");
  const matches = fileNames
    .filter((name) => isSupportedSourceFile(name) && pattern.test(name))
    .sort();

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

    return { layer, sourcePath: path.join(sourceDir, match) };
  });
}

export async function resolvePlateSources(sourceDir: string): Promise<PlateSource[]> {
  return matchPlateSources(await readdir(sourceDir), sourceDir);
}
