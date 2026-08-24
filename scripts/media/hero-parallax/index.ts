/**
 * Builds the homepage hero parallax plates and uploads them to R2.
 *
 * Ready-made AVIF / WebP exports are copied as-is. JPEG composites over black
 * still go through the keying pass in ./black-key.ts when the dest is WebP.
 * R2 is the source of truth; `--include-sources` archives PNG originals beside
 * the published plates so the stack can be re-run later.
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
const PASSTHROUGH_STILLS = new Set([".avif", ".webp"]);

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function stillKind(fileName: string): string {
  return path.extname(fileName).replace(/^\./, "") || "still";
}

/**
 * Archives the raw export under the configured plate stem so named packs
 * (`fallback.png`) and leftover `layer-N` packs both land in a predictable key.
 */
function sourceKeyFor(layerFile: string, sourcePath: string): string {
  const stem = path.basename(layerFile, path.extname(layerFile));
  const extension = path.extname(sourcePath).replace(/^\./, "") || "png";
  return `${HERO_PARALLAX_KEY_PREFIX}/source/${stem}.${extension}`;
}

function isReadyPassthrough(sourcePath: string): boolean {
  return PASSTHROUGH_STILLS.has(path.extname(sourcePath).toLowerCase());
}

async function stageStill(
  source: PlateSource,
  outPath: string,
): Promise<{ bytes: number; keyed: boolean; built?: BuiltPlate }> {
  const destExt = path.extname(source.layer.file).toLowerCase();
  const srcExt = path.extname(source.sourcePath).toLowerCase();

  if (isReadyPassthrough(source.sourcePath) && srcExt === destExt) {
    await copyFile(source.sourcePath, outPath);
    return { bytes: (await stat(outPath)).size, keyed: false };
  }

  if (destExt !== ".webp") {
    throw new Error(
      `Layer ${source.layer.depth} is configured as ${source.layer.file} but the matched export is ${path.basename(source.sourcePath)}. Supply a matching AVIF/WebP, or a JPEG for the WebP black-key pass.`,
    );
  }

  const plate = await buildPlate(source);
  await writeFile(outPath, plate.webp);
  return { bytes: plate.webp.length, keyed: true, built: plate };
}

async function main(): Promise<void> {
  const options = parseHeroParallaxArgs(process.argv.slice(2));
  const outDir = path.resolve(options.outDir);
  await mkdir(outDir, { recursive: true });

  const { plates: sources, backgroundPath, backgroundPngPath } =
    await resolveParallaxSources(path.resolve(options.sourceDir));

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
      `  layer ${source.layer.depth} (${source.layer.subject}): ${formatKb(staged.bytes)} ${stillKind(source.layer.file)}${
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
    console.log("Skipping composite preview — ready-made AVIF/WebP plates are used as-is.");
  }

  if (backgroundPath) {
    const srcExt = path.extname(backgroundPath).toLowerCase();
    const destExt = path.extname(HERO_PARALLAX_BACKGROUND_FILE).toLowerCase();
    if (srcExt !== destExt) {
      throw new Error(
        `Projects ground is configured as ${HERO_PARALLAX_BACKGROUND_FILE} but the matched export is ${path.basename(backgroundPath)}.`,
      );
    }

    console.log(
      `  projects ground: ${path.basename(backgroundPath)} -> ${HERO_PARALLAX_BACKGROUND_FILE}`,
    );
  } else {
    console.log("  projects ground: missing (Recent Projects keeps the section fill)");
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
      const stillFile = path.join(outDir, source.layer.file);
      await putMediaObject({
        bucket,
        key: stillKey,
        file: stillFile,
        contentType: contentTypeForFile(stillFile),
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
      const archivePath =
        source.pngPath ?? (isReadyPassthrough(source.sourcePath) ? null : source.sourcePath);
      if (!archivePath) {
        continue;
      }

      const key = sourceKeyFor(source.layer.file, archivePath);
      await putMediaObject({
        bucket,
        key,
        file: archivePath,
        contentType: contentTypeForFile(archivePath),
      });
      console.log(`  put ${key}`);
    }

    if (backgroundPngPath) {
      const key = sourceKeyFor(HERO_PARALLAX_BACKGROUND_FILE, backgroundPngPath);
      await putMediaObject({
        bucket,
        key,
        file: backgroundPngPath,
        contentType: contentTypeForFile(backgroundPngPath),
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
