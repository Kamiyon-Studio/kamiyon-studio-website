#!/usr/bin/env tsx
/**
 * Inspect indexing state for important URLs via the URL Inspection API.
 *
 * Usage:
 *   pnpm seo:inspect
 *   pnpm seo:inspect -- https://kamiyonstudio.com/about
 */

import { importantAbsoluteUrls } from "../../lib/seo/important-urls";
import { createSearchConsoleClients } from "./lib/auth";
import {
  describeMissingAuth,
  getSearchConsoleSiteUrl,
  readSearchConsoleEnv,
} from "./lib/config";

async function main() {
  const env = readSearchConsoleEnv();
  const missing = describeMissingAuth(env);
  if (missing.length > 0) {
    console.error("Google Search Console API credentials are not configured.\n");
    for (const line of missing) {
      console.error(`- ${line}`);
    }
    console.error("\nRefusing to invent indexing status without Google API access.");
    process.exit(1);
  }

  const siteUrl = getSearchConsoleSiteUrl();
  const cliUrls = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const urls = cliUrls.length > 0 ? cliUrls : importantAbsoluteUrls();
  const { searchconsole } = createSearchConsoleClients(env);

  console.log("# Search Console URL inspection\n");
  console.log(`Property: ${siteUrl}`);
  console.log(`URLs: ${urls.length}\n`);

  for (const inspectionUrl of urls) {
    try {
      const response = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl,
        },
      });
      const result = response.data.inspectionResult;
      const index = result?.indexStatusResult;
      console.log(`URL: ${inspectionUrl}`);
      console.log(`  verdict: ${index?.verdict ?? "n/a"}`);
      console.log(`  coverage: ${index?.coverageState ?? "n/a"}`);
      console.log(`  indexing: ${index?.indexingState ?? "n/a"}`);
      console.log(`  robots: ${index?.robotsTxtState ?? "n/a"}`);
      console.log(`  pageFetch: ${index?.pageFetchState ?? "n/a"}`);
      console.log(
        `  googleCanonical: ${index?.googleCanonical ?? "n/a"}`,
      );
      console.log(`  userCanonical: ${index?.userCanonical ?? "n/a"}`);
      console.log(`  lastCrawl: ${index?.lastCrawlTime ?? "n/a"}`);
      console.log("");
    } catch (error) {
      console.log(`URL: ${inspectionUrl}`);
      console.log(
        `  error: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.log("");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
