#!/usr/bin/env tsx
/**
 * Submit or inspect the production sitemap in Google Search Console.
 *
 * Usage:
 *   pnpm seo:sitemap
 *   pnpm seo:sitemap -- --submit
 */

import { createSearchConsoleClients } from "./lib/auth";
import {
  describeMissingAuth,
  getSearchConsoleSiteUrl,
  getSitemapUrl,
  readSearchConsoleEnv,
} from "./lib/config";

async function main() {
  const submit = process.argv.includes("--submit");
  const env = readSearchConsoleEnv();
  const missing = describeMissingAuth(env);
  if (missing.length > 0) {
    console.error("Google Search Console API credentials are not configured.\n");
    for (const line of missing) {
      console.error(`- ${line}`);
    }
    process.exit(1);
  }

  const siteUrl = getSearchConsoleSiteUrl();
  const feedpath = getSitemapUrl();
  const { webmasters } = createSearchConsoleClients(env);

  if (submit) {
    await webmasters.sitemaps.submit({ siteUrl, feedpath });
    console.log(`Submitted sitemap to Search Console:\n  property: ${siteUrl}\n  sitemap:  ${feedpath}`);
  }

  const listed = await webmasters.sitemaps.list({ siteUrl });
  const entries = listed.data.sitemap ?? [];
  const match = entries.find((entry) => entry.path === feedpath);

  console.log("\n# Search Console sitemaps\n");
  console.log(`Property: ${siteUrl}`);
  if (entries.length === 0) {
    console.log("No sitemaps reported yet.");
  }
  for (const entry of entries) {
    const mark = entry.path === feedpath ? "→" : "-";
    console.log(
      `${mark} ${entry.path} | errors=${entry.errors ?? 0} warnings=${entry.warnings ?? 0} lastSubmitted=${entry.lastSubmitted ?? "n/a"}`,
    );
  }

  if (!match && !submit) {
    console.log(
      `\nSitemap ${feedpath} is not listed yet. Run \`pnpm seo:sitemap -- --submit\` after GSC verification.`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
