#!/usr/bin/env node
/**
 * Upload portfolio screenshots to production R2.
 *
 * Usage:
 *   pnpm tsx scripts/sanity/upload-portfolio-media.ts
 *   pnpm tsx scripts/sanity/upload-portfolio-media.ts --dry-run
 */

import { readdirSync } from "node:fs";
import path from "node:path";

import {
  contentTypeForFile,
  MEDIA_BUCKETS,
  putMediaObject,
} from "../media/hero-parallax/upload";

const ASSETS_DIR =
  "C:\\Users\\limos\\.cursor\\projects\\o-Documents-GitHub-kamiyon-studio-website\\assets";

type PortfolioMediaUpload = {
  sourceSuffix: string;
  key: string;
};

const UPLOADS: PortfolioMediaUpload[] = [
  {
    sourceSuffix: "image-f8d42387-84c7-4928-96ff-8416e0de8969.jpg",
    key: "portfolio/vocabu-wildlife-edition/cover.jpg",
  },
  {
    sourceSuffix: "image-6c57dd14-c93d-40fd-988d-0541c25070f0.jpg",
    key: "portfolio/vocabu-wildlife-edition/gallery-01-level-select.jpg",
  },
  {
    sourceSuffix: "image-7a07c4ef-67d0-4466-bea0-ff46d0a22977.jpg",
    key: "portfolio/vocabu-wildlife-edition/gallery-02-word-completion.jpg",
  },
  {
    sourceSuffix: "image-b645fd01-7cf6-44f6-9486-69b3b06b76e5.jpg",
    key: "portfolio/vocabu-wildlife-edition/gallery-03-classification.jpg",
  },
  {
    sourceSuffix: "image-c92bf2e2-cffc-4765-9570-83e80626bd56.png",
    key: "portfolio/debug-log/cover.png",
  },
  {
    sourceSuffix: "image-16a21f3c-5082-45a5-b117-fddfe966aad3.png",
    key: "portfolio/debug-log/gallery-01-character-select.png",
  },
  {
    sourceSuffix: "image-f07067dc-8e7a-47bf-928d-9b4d18cba977.png",
    key: "portfolio/debug-log/gallery-02-tutorial.png",
  },
  {
    sourceSuffix: "image-217645b2-4578-474c-9fb5-38f1ad8dc5bf.png",
    key: "portfolio/debug-log/gallery-03-gameplay-targeting.png",
  },
  {
    sourceSuffix: "image-f46cf822-eb4a-477b-b423-0e63035f6a8b.png",
    key: "portfolio/debug-log/gallery-04-debug-card.png",
  },
  {
    sourceSuffix: "image-809b7627-8dd5-4f73-b664-944b12f4769e.png",
    key: "portfolio/debug-log/gallery-05-coffee-powerup.png",
  },
  {
    sourceSuffix: "image-294c3ad9-103d-4593-ac44-3b79abfec301.png",
    key: "portfolio/flappy-awie/cover.png",
  },
  {
    sourceSuffix: "image-c27dd3ee-2f7c-4221-8c64-7ecd7bfd28c5.jpg",
    key: "portfolio/flappy-awie/gallery-01-game-over.jpg",
  },
  {
    sourceSuffix: "image-1d4f3afd-f9bc-4757-94b1-8b4fc533e9dc.jpg",
    key: "portfolio/flappy-awie/gallery-02-gameplay.jpg",
  },
];

function resolveSourceFile(suffix: string): string {
  const match = readdirSync(ASSETS_DIR).find((name) => name.includes(suffix));
  if (!match) {
    throw new Error(`No asset file matching suffix ${suffix} in ${ASSETS_DIR}`);
  }

  return path.join(ASSETS_DIR, match);
}

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const dryRun = argv.includes("--dry-run");
  const bucket = MEDIA_BUCKETS.production;

  for (const upload of UPLOADS) {
    const file = resolveSourceFile(upload.sourceSuffix);
    const contentType = contentTypeForFile(file);

    if (dryRun) {
      console.log(`[dry-run] ${upload.key} <= ${file}`);
      continue;
    }

    console.log(`[upload] ${upload.key}`);
    await putMediaObject({
      bucket,
      key: upload.key,
      file,
      contentType,
    });
  }

  console.log(
    dryRun
      ? `[upload-portfolio-media] planned ${UPLOADS.length} objects (dry-run)`
      : `[upload-portfolio-media] uploaded ${UPLOADS.length} objects to ${bucket}`,
  );

  return 0;
}

main().then((code) => {
  process.exit(code);
});
