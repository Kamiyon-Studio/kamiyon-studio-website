/**
 * Mockable R2 MEDIA_BUCKET binding for upload routes.
 * Tests inject a fake bucket; production resolves Cloudflare env.MEDIA_BUCKET.
 */

type MediaBucketPutOptions = {
  httpMetadata?: {
    contentType?: string;
  };
};

export type MediaBucket = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | Blob | string | ReadableStream | null,
    options?: MediaBucketPutOptions,
  ) => Promise<unknown>;
};

let mediaBucketOverride: MediaBucket | null = null;

/** Test-only: inject (or clear) the MEDIA_BUCKET binding. */
export function setMediaBucketForTests(bucket: MediaBucket | null): void {
  mediaBucketOverride = bucket;
}

export async function resolveMediaBucket(): Promise<MediaBucket> {
  if (mediaBucketOverride) {
    return mediaBucketOverride;
  }

  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  const bucket = (env as { MEDIA_BUCKET?: MediaBucket }).MEDIA_BUCKET;

  if (!bucket) {
    throw new Error("MEDIA_BUCKET binding is not configured");
  }

  return bucket;
}
