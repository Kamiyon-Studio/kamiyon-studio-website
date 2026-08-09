#!/usr/bin/env tsx
/**
 * Verifies Search Console API credentials can list the configured property.
 */

import { createSearchConsoleClients } from "./lib/auth";
import { getSearchConsoleSiteUrl, readSearchConsoleEnv, describeMissingAuth } from "./lib/config";

async function main() {
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
  const { webmasters } = createSearchConsoleClients(env);
  const response = await webmasters.sites.list();
  const entries = response.data.siteEntry ?? [];
  const match = entries.find((entry) => entry.siteUrl === siteUrl);

  console.log("# Search Console auth check\n");
  console.log(`Configured property: ${siteUrl}`);
  console.log(`Sites visible to credentials: ${entries.length}`);
  for (const entry of entries) {
    console.log(`- ${entry.siteUrl} (${entry.permissionLevel ?? "unknown"})`);
  }

  if (!match) {
    console.error(
      `\nConfigured property "${siteUrl}" was not found for these credentials.`,
    );
    console.error(
      "Add the service account / OAuth user in Search Console → Settings → Users and permissions.",
    );
    process.exit(1);
  }

  console.log("\n✓ Credentials can access the configured property.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
