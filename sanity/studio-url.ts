/**
 * Hosted Sanity Studio URL helpers.
 * Studio is deployed via `pnpm sanity:deploy` (*.sanity.studio), not embedded in the Worker.
 */

const DEFAULT_STUDIO_HOSTNAME = "kamiyon";

/**
 * Resolve the canonical hosted Studio URL (no trailing slash).
 *
 * Priority:
 * 1. `NEXT_PUBLIC_SANITY_STUDIO_URL` (full URL)
 * 2. `SANITY_STUDIO_HOSTNAME` → `https://{host}.sanity.studio`
 * 3. Default hostname `kamiyon`
 */
export function getHostedStudioUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const hostname =
    process.env.SANITY_STUDIO_HOSTNAME?.trim() || DEFAULT_STUDIO_HOSTNAME;
  const host = hostname
    .replace(/^https?:\/\//, "")
    .replace(/\.sanity\.studio\/?$/, "")
    .replace(/\/$/, "");

  return `https://${host}.sanity.studio`;
}

/**
 * Origin for Studio → site API calls (media upload). No trailing slash.
 * Falls back to relative same-origin when unset (local `sanity dev` proxy / embedded).
 */
function getStudioApiOrigin(): string | null {
  const origin =
    process.env.SANITY_STUDIO_API_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  if (!origin) {
    return null;
  }
  return origin.replace(/\/$/, "");
}

export function getMediaUploadUrl(): string {
  const origin = getStudioApiOrigin();
  return origin ? `${origin}/api/media/upload` : "/api/media/upload";
}
