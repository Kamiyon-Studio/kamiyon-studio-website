/**
 * Cloudflare Web Analytics beacon resolution (T14).
 *
 * `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` is a build-time public var (see
 * `context/analytics-setup.md`). Resolution is pure so the beacon can be
 * verified without a browser or a live Cloudflare site.
 */

export const CF_BEACON_SRC =
  "https://static.cloudflareinsights.com/beacon.min.js";

export type CloudflareBeaconEnv = {
  /** `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` — Cloudflare site tag. */
  token?: string | null;
  /** `APP_ENV` — `local` | `staging` | `production`. */
  appEnv?: string | null;
  /** `NODE_ENV` — `development` under `next dev`. */
  nodeEnv?: string | null;
};

export type CloudflareBeacon = {
  src: string;
  /** Serialized `data-cf-beacon` payload. */
  config: string;
};

/**
 * Local development must never send hits to a real analytics site.
 * Mirrors the `APP_ENV` / `NODE_ENV` check used by the media upload route.
 */
export function isDevelopmentEnv({ appEnv, nodeEnv }: CloudflareBeaconEnv): boolean {
  return appEnv?.trim() === "local" || nodeEnv?.trim() === "development";
}

/**
 * Returns beacon attributes, or `null` when analytics must stay off:
 * missing/blank token, or a development environment.
 */
export function resolveCloudflareBeacon(
  env: CloudflareBeaconEnv,
): CloudflareBeacon | null {
  const token = env.token?.trim();

  if (!token || isDevelopmentEnv(env)) {
    return null;
  }

  return {
    src: CF_BEACON_SRC,
    // `spa: true` reports App Router client navigations as page views.
    config: JSON.stringify({ token, spa: true }),
  };
}
