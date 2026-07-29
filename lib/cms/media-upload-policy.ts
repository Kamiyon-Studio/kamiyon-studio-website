/** Explicit image MIME allowlist for authenticated Studio uploads. */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** Maximum upload size before buffering (10 MiB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_SET = new Set<string>(ALLOWED_UPLOAD_MIME_TYPES);

/** Lowercase MIME type with parameters stripped (e.g. `; charset=…`). */
export function normalizeMimeType(value: string): string {
  const base = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  return base;
}

export function isAllowedUploadMimeType(value: string): boolean {
  const normalized = normalizeMimeType(value);
  return normalized.length > 0 && ALLOWED_SET.has(normalized);
}

export function isWithinUploadSizeLimit(byteLength: number): boolean {
  return byteLength >= 0 && byteLength <= MAX_UPLOAD_BYTES;
}

/**
 * Parse Content-Length for pre-formData size checks.
 * Returns null when absent or not a non-negative integer.
 */
export function parseContentLength(header: string | null): number | null {
  if (header == null || header.trim() === "") {
    return null;
  }
  if (!/^\d+$/.test(header.trim())) {
    return null;
  }
  const n = Number(header.trim());
  if (!Number.isSafeInteger(n) || n < 0) {
    return null;
  }
  return n;
}
