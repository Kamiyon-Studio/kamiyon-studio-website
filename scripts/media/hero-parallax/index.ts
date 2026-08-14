/**
 * Builds the homepage hero parallax plates and uploads them to R2.
 *
 * Ready-made WebP / WebM / MP4 exports (the v2 stack) are copied as-is. JPEG
 * composites over black still go through the keying pass in ./black-key.ts.
 * R2 is the source of truth; `--include-sources` archives PNG/JPEG originals
 * beside the published plates so the stack can be re-run later.
 *
 *   pnpm media:hero-parallax -- --source "C:/path/to/exports"            # build only
 *   pnpm media:hero-parallax -- --source "C:/path/to/exports" --apply    # build + upload
 */

import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildHeroParallaxLayerKey,
  HERO_PARALLAX_BACKGROUND_FILE,
  HERO_PARALLAX_KEY_PREFIX,
} from "@/lib/home/hero-parallax-layers";

import { parseHeroParallaxArgs } from "./args";
import { buildPlate, renderStackPreview, type BuiltPlate } from "./build";
import {
  resolveParallaxSources,
  type PlateSource,
} from "./plate-sources";
import { contentTypeForFile, MEDIA_BUCKETS, putMediaObject } from "./upload";

const PREVIEW_FILE = "stack-preview.jpg";

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

/**
 * Archives the raw export under a predictable name. Exports arrive with
 * tool-generated file names and frequently the wrong suffix, so the key is
 * rebuilt from the depth and the format sharp actually decoded.
 */
function sourceKeyFor(depth: number, sourcePath: string): string {
  const extension = path.extname(sourcePath).replace(/^\./, "") || "png";
  return `${HERO_PARALLAX_KEY_PREFIX}/source/layer-${depth}.${extension}`;
}

function isReadyWebp(sourcePath: string): boolean {
  return path.extname(sourcePath).toLowerCase() === ".webp";
}

async function stageStill(
  source: PlateSource,
  outPath: string,
): Promise<{ bytes: number; keyed: boolean; built?: BuiltPlate }> {
  if (isReadyWebp(source.sourcePath)) {
    await copyFile(source.sourcePath, outPath);
    return { bytes: (await stat(outPath)).size, keyed: false };
  }

  const plate = await buildPlate(source);
  await writeFile(outPath, plate.webp);
  return { bytes: plate.webp.length, keyed: true, built: plate };
}

async function main(): Promise<void> {
  const options = parseHeroParallaxArgs(process.argv.slice(2));
  const outDir = path.resolve(options.outDir);
  await mkdir(outDir, { recursive: true });

  const { plates: sources, backgroundPath } = await resolveParallaxSources(
    path.resolve(options.sourceDir),
  );

  console.log(`Building ${sources.length} plates from ${options.sourceDir}`);
  const previewPlates: BuiltPlate[] = [];

  for (const source of sources) {
    const outPath = path.join(outDir, source.layer.file);
    const staged = await stageStill(source, outPath);
    const extras = [
      source.webmPath ? "webm" : null,
      source.mp4Path ? "mp4" : null,
    ].filter(Boolean);

    console.log(
      `  layer ${source.layer.depth} (${source.layer.subject}): ${formatKb(staged.bytes)} webp${
        staged.keyed ? ", keyed" : ", passthrough"
      }${extras.length > 0 ? `, ${extras.join("+")}` : ""} -> ${path.relative(process.cwd(), outPath)}`,
    );

    if (staged.built) {
      previewPlates.push(staged.built);
    }
  }

  if (previewPlates.length === sources.length) {
    const previewPath = path.join(outDir, PREVIEW_FILE);
    await writeFile(previewPath, await renderStackPreview(previewPlates));
    console.log(`Wrote composite preview -> ${path.relative(process.cwd(), previewPath)}`);
  } else {
    console.log("Skipping composite preview — ready-made WebP plates are used as-is.");
  }

  if (backgroundPath) {
    console.log(
      `  underlay: ${path.basename(backgroundPath)} -> ${HERO_PARALLAX_BACKGROUND_FILE}`,
    );
  } else {
    console.log("  underlay: missing (hero will keep the charcoal fill behind the plates)");
  }

  if (!options.apply) {
    console.log(
      `\nDry run — nothing uploaded. Re-run with --apply to publish to: ${options.targets.join(", ")}`,
    );
    return;
  }

  for (const target of options.targets) {
    const bucket = MEDIA_BUCKETS[target];
    console.log(`\nUploading to ${target} (${bucket})`);

    for (const source of sources) {
      const stillKey = buildHeroParallaxLayerKey(source.layer.file);
      await putMediaObject({
        bucket,
        key: stillKey,
        file: path.join(outDir, source.layer.file),
        contentType: "image/webp",
      });
      console.log(`  put ${stillKey}`);

      const motionFiles = [source.webmPath, source.mp4Path].filter(
        (file): file is string => Boolean(file),
      );
      for (const file of motionFiles) {
        const key = buildHeroParallaxLayerKey(path.basename(file));
        await putMediaObject({
          bucket,
          key,
          file,
          contentType: contentTypeForFile(file),
        });
        console.log(`  put ${key}`);
      }
    }

    if (backgroundPath) {
      const key = buildHeroParallaxLayerKey(HERO_PARALLAX_BACKGROUND_FILE);
      await putMediaObject({
        bucket,
        key,
        file: backgroundPath,
        contentType: contentTypeForFile(backgroundPath),
      });
      console.log(`  put ${key}`);
    }

    if (!options.includeSources) {
      continue;
    }

    for (const source of sources) {
      const archivePath = source.pngPath ?? (isReadyWebp(source.sourcePath) ? null : source.sourcePath);
      if (!archivePath) {
        continue;
      }

      const key = sourceKeyFor(source.layer.depth, archivePath);
      await putMediaObject({
        bucket,
        key,
        file: archivePath,
        contentType: contentTypeForFile(archivePath),
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
