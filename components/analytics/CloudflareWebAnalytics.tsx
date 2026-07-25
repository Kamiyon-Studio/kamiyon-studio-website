import Script from "next/script";

import {
  resolveCloudflareBeacon,
  type CloudflareBeaconEnv,
} from "@/lib/analytics/cloudflare-web-analytics";

/**
 * Cloudflare Web Analytics beacon (T14). Renders nothing without a site token
 * or in development, so local dev and previews stay clean and silent.
 * Props exist for tests; production reads env — see `context/analytics-setup.md`.
 */
export function CloudflareWebAnalytics({
  token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
  appEnv = process.env.APP_ENV,
  nodeEnv = process.env.NODE_ENV,
}: CloudflareBeaconEnv = {}) {
  const beacon = resolveCloudflareBeacon({ token, appEnv, nodeEnv });

  if (!beacon) {
    return null;
  }

  return (
    <Script
      defer
      src={beacon.src}
      strategy="afterInteractive"
      data-cf-beacon={beacon.config}
    />
  );
}
