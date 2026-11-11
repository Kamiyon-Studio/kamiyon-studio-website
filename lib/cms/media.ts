import type { CmsImage } from "./types";

export type R2AssetRef = {
  url?: string | null;
  key?: string | null;
  alt?: string | null;
  caption?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  _key?: string | null;
};

export type MediaUploadResult = {
  key: string;
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
};

/** Strip leading slashes and collapse path noise for R2 object keys. */
export function normalizeMediaKey(key: string): string {
  return key.trim().replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

/** Builds a public R2 CDN URL from an explicit url or key + base env. */
export function getMediaUrl(
  asset: Pick<R2AssetRef, "url" | "key"> | null | undefined,
): string | null {
  if (!asset) {
    return null;
  }

  if (typeof asset.url === "string" && asset.url.trim()) {
    return asset.url.trim();
  }

  const key = typeof asset.key === "string" ? normalizeMediaKey(asset.key) : "";
  if (!key) {
    return null;
  }

  return buildMediaPublicUrl(key);
}

/** Resolve `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` + key into a public CDN URL. */
export function buildMediaPublicUrl(key: string): string | null {
  const normalized = normalizeMediaKey(key);
  if (!normalized) {
    return null;
  }

  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!base) {
    return null;
  }

  return `${base}/${normalized}`;
}

/** Sanitize an upload filename for use inside an R2 object key. */
export function sanitizeMediaFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop()?.trim() || "file";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .toLowerCase();

  return cleaned || "file";
}

/** Create a dated, unique R2 object key for an uploaded file. */
export function createMediaObjectKey(filename: string, now: Date = new Date()): string {
  const safe = sanitizeMediaFilename(filename);
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  return `uploads/${yyyy}/${mm}/${id}-${safe}`;
}

/**
 * Best-effort image dimension probe for common formats.
 * Returns null when the buffer is not a recognized still image.
 */
export function readImageDimensions(
  bytes: Uint8Array,
  mimeType?: string | null,
): { width: number; height: number } | null {
  if (bytes.byteLength < 24) {
    return null;
  }

  const type = (mimeType ?? "").toLowerCase();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (type.includes("png") || isPng(bytes)) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  if (type.includes("gif") || isGif(bytes)) {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }

  if (type.includes("jpeg") || type.includes("jpg") || isJpeg(bytes)) {
    return readJpegDimensions(bytes);
  }

  if (type.includes("webp") || isWebp(bytes)) {
    return readWebpDimensions(bytes);
  }

  return null;
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isGif(bytes: Uint8Array): boolean {
  return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8;
}

function isWebp(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function readJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.byteLength) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1]!;
    // SOF0–SOF3, SOF5–SOF7, SOF9–SOF11, SOF13–SOF15
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      return {
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      };
    }

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const length = view.getUint16(offset + 2);
    if (length < 2) {
      break;
    }
    offset += 2 + length;
  }

  return null;
}

function readWebpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  // VP8L packs width and height into the low 28 bits after its 0x2f signature.
  if (
    bytes.byteLength >= 25 &&
    bytes[12] === 0x56 && bytes[13] === 0x50 &&
    bytes[14] === 0x38 && bytes[15] === 0x4c && bytes[20] === 0x2f
  ) {
    const bits = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(21, true);
    if ((bits >>> 29) !== 0) return null;
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }

  // VP8X extended header
  if (
    bytes.byteLength >= 30 &&
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    bytes[15] === 0x58
  ) {
    const width = 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16);
    const height = 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16);
    return { width, height };
  }

  // VP8 lossy bitstream
  if (
    bytes.byteLength >= 30 &&
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    bytes[15] === 0x20
  ) {
    const width = (bytes[26]! | (bytes[27]! << 8)) & 0x3fff;
    const height = (bytes[28]! | (bytes[29]! << 8)) & 0x3fff;
    return { width, height };
  }

  return null;
}

/** Maps a Sanity `r2Asset` object into the shared CmsImage shape. */
export function mapR2AssetToCmsImage(
  asset: R2AssetRef | null | undefined,
  overrides?: Partial<Pick<CmsImage, "alt" | "caption" | "_key">>,
): CmsImage | undefined {
  if (!asset || typeof asset !== "object") {
    return undefined;
  }

  const url = getMediaUrl(asset);
  const alt = overrides?.alt ?? asset.alt ?? null;
  const caption = overrides?.caption ?? asset.caption ?? null;
  const key = overrides?._key ?? (typeof asset._key === "string" ? asset._key : undefined);

  if (!url && !alt && !caption && !key) {
    return undefined;
  }

  return {
    ...(key ? { _key: key } : {}),
    ...(url ? { url } : {}),
    ...(typeof asset.key === "string" && asset.key.trim()
      ? { key: normalizeMediaKey(asset.key) }
      : {}),
    alt,
    caption,
  };
}
