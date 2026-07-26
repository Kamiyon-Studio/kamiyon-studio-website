import Script from "next/script";

const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

type CloudflareWebAnalyticsProps = {
  /**
   * Optional override for tests. Production usage omits this and reads
   * `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN`.
   */
  token?: string | null;
};

/**
 * Cloudflare Web Analytics beacon (T14). Injects only when a site token is
 * present so local/dev builds stay clean without the env var.
 */
export function CloudflareWebAnalytics({
  token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
}: CloudflareWebAnalyticsProps = {}) {
  const resolved = token?.trim();
  if (!resolved) {
    return null;
  }

  return (
    <Script
      defer
      src={BEACON_SRC}
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: resolved, spa: true })}
    />
  );
}
