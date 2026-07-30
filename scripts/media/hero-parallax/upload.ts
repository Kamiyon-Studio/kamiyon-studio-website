import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * Media buckets that back `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` per environment.
 * Keep in sync with the `MEDIA_BUCKET` bindings in `wrangler.jsonc`.
 */
export const MEDIA_BUCKETS = {
  staging: "kamiyon-media-staging",
  production: "kamiyon-media-prod",
} as const;

export type MediaTarget = keyof typeof MEDIA_BUCKETS;

export function isMediaTarget(value: string): value is MediaTarget {
  return value in MEDIA_BUCKETS;
}

/**
 * Site chrome is immutable per key — the key prefix carries a version segment,
 * so a long CDN lifetime is safe and avoids revalidating on every hero view.
 */
export const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export type PutObjectRequest = {
  bucket: string;
  key: string;
  file: string;
  contentType: string;
  cacheControl?: string;
};

export function buildWranglerPutArgs({
  bucket,
  key,
  file,
  contentType,
  cacheControl = IMMUTABLE_CACHE_CONTROL,
}: PutObjectRequest): string[] {
  return [
    "r2",
    "object",
    "put",
    `${bucket}/${key}`,
    "--file",
    file,
    "--content-type",
    contentType,
    "--cache-control",
    cacheControl,
    // Wrangler defaults to the local simulator; this has to hit real R2.
    "--remote",
  ];
}

/**
 * Resolves Wrangler's CLI entry point so it can be spawned through `node`.
 *
 * Going via `npx` would need `shell: true` on Windows, which concatenates
 * arguments unquoted and so mangles values containing spaces or commas. The bin
 * path is read from the manifest because Wrangler's `exports` map does not
 * expose it directly.
 */
function resolveWranglerBin(): string {
  const require = createRequire(import.meta.url);
  const manifestPath = require.resolve("wrangler/package.json");
  const manifest = require(manifestPath) as { bin?: Record<string, string> };
  const relativeBin = manifest.bin?.wrangler;

  if (!relativeBin) {
    throw new Error(`wrangler package at ${manifestPath} declares no "wrangler" bin`);
  }

  return path.resolve(path.dirname(manifestPath), relativeBin);
}

/** Uploads one object through the Wrangler CLI, reusing its existing auth. */
export async function putMediaObject(request: PutObjectRequest): Promise<void> {
  const args = buildWranglerPutArgs(request);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [resolveWranglerBin(), ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      process.stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `wrangler r2 object put ${request.bucket}/${request.key} exited with code ${code}\n${stderr}`,
        ),
      );
    });
  });
}
