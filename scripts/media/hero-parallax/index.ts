/**
 * Builds the homepage hero parallax plates and uploads them to R2.
 *
 * The raw exports are JPEG with black backing (see ./black-key.ts) and are not
 * committed: R2 is the source of truth for the plates, and `--include-sources`
 * keeps the raw exports beside them so the keying can be re-run later.
 *
 *   pnpm media:hero-parallax -- --source "C:/path/to/exports"            # build only
 *   pnpm media:hero-parallax -- --source "C:/path/to/exports" --apply    # build + upload
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildHeroParallaxLayerKey,
  HERO_PARALLAX_KEY_PREFIX,
} from "@/lib/home/hero-parallax-layers";

import { parseHeroParallaxArgs } from "./args";
import { buildPlate, renderStackPreview, type BuiltPlate } from "./build";
import { resolvePlateSources } from "./plate-sources";
import { MEDIA_BUCKETS, putMediaObject } from "./upload";

const PREVIEW_FILE = "stack-preview.jpg";

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

/**
 * Archives the raw export under a predictable name. Exports arrive with
 * tool-generated file names and frequently the wrong suffix, so the key is
 * rebuilt from the depth and the format sharp actually decoded.
 */
function sourceKeyFor(plate: BuiltPlate): string {
  return `${HERO_PARALLAX_KEY_PREFIX}/source/layer-${plate.layer.depth}.${plate.sourceFormat}`;
}

async function main(): Promise<void> {
  const options = parseHeroParallaxArgs(process.argv.slice(2));
  const outDir = path.resolve(options.outDir);
  await mkdir(outDir, { recursive: true });

  const sources = await resolvePlateSources(path.resolve(options.sourceDir));

  console.log(`Building ${sources.length} plates from ${options.sourceDir}`);
  const plates: BuiltPlate[] = [];
  for (const source of sources) {
    const plate = await buildPlate(source);
    const outPath = path.join(outDir, plate.layer.file);
    await writeFile(outPath, plate.webp);
    plates.push(plate);

    console.log(
      `  layer ${plate.layer.depth} (${plate.layer.subject}): ${formatKb(plate.webp.length)} webp, ${(plate.transparency * 100).toFixed(1)}% keyed out -> ${path.relative(process.cwd(), outPath)}`,
    );
  }

  const previewPath = path.join(outDir, PREVIEW_FILE);
  await writeFile(previewPath, await renderStackPreview(plates));
  console.log(`Wrote composite preview -> ${path.relative(process.cwd(), previewPath)}`);

  if (!options.apply) {
    console.log(
      `\nDry run — nothing uploaded. Re-run with --apply to publish to: ${options.targets.join(", ")}`,
    );
    return;
  }

  for (const target of options.targets) {
    const bucket = MEDIA_BUCKETS[target];
    console.log(`\nUploading to ${target} (${bucket})`);

    for (const plate of plates) {
      const key = buildHeroParallaxLayerKey(plate.layer.file);
      await putMediaObject({
        bucket,
        key,
        file: path.join(outDir, plate.layer.file),
        contentType: "image/webp",
      });
      console.log(`  put ${key}`);
    }

    if (!options.includeSources) {
      continue;
    }

    for (const plate of plates) {
      const key = sourceKeyFor(plate);
      await putMediaObject({
        bucket,
        key,
        file: plate.sourcePath,
        contentType: `image/${plate.sourceFormat}`,
      });
      console.log(`  put ${key}`);
    }
  }

  console.log("\nDone.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
