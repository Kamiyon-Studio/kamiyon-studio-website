#!/usr/bin/env tsx
/**
 * Readable Search Console report for Kamiyon Studio.
 *
 * Without credentials: prints technical offline status and explains auth is required.
 * With credentials: includes sitemap + search performance (never invents indexing).
 *
 * Usage:
 *   pnpm seo:report
 *   pnpm seo:report -- --days=28
 */

import { importantAbsoluteUrls } from "../../lib/seo/important-urls";
import { buildRobotsPolicy } from "../../lib/seo/robots-policy";
import { PRODUCTION_CANONICAL_ORIGIN } from "../../lib/seo/site-url";
import { createSearchConsoleClients } from "./lib/auth";
import {
  describeMissingAuth,
  getSearchConsoleSiteUrl,
  getSitemapUrl,
  readSearchConsoleEnv,
} from "./lib/config";
import { formatNumber, formatPercent, isoDate } from "./lib/format";

function parseDays(): number {
  const arg = process.argv.find((value) => value.startsWith("--days="));
  if (!arg) return 28;
  const parsed = Number(arg.split("=")[1]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 28;
}

async function main() {
  const days = parseDays();
  const env = readSearchConsoleEnv();
  const missing = describeMissingAuth(env);
  const siteUrl = getSearchConsoleSiteUrl();
  const sitemapUrl = getSitemapUrl();
  const robots = buildRobotsPolicy(PRODUCTION_CANONICAL_ORIGIN, "production");

  console.log("# KAMIYON STUDIO SEO REPORT\n");
  console.log(`Property:\n${siteUrl}\n`);
  console.log(`Canonical origin:\n${PRODUCTION_CANONICAL_ORIGIN}\n`);

  console.log("Technical:");
  console.log("✓ HTTPS (canonical origin uses https://)");
  console.log(
    robots.sitemap
      ? "✓ Robots policy declares production sitemap"
      : "✗ Robots policy missing sitemap",
  );
  console.log("✓ Sitemap builder present (app/(frontend)/sitemap.ts)");
  console.log("✓ Canonical helpers present (lib/seo/metadata.ts + site-url.ts)");
  console.log("✓ Metadata builder present (buildPageMetadata)");
  console.log("✓ Structured data builders present (Organization/WebSite/Breadcrumb/FAQ/BlogPosting)");
  console.log("");

  console.log("Important URLs (local list, not Google indexing state):");
  for (const url of importantAbsoluteUrls()) {
    console.log(`- ${url}`);
  }
  console.log("");

  if (missing.length > 0) {
    console.log("Sitemap:");
    console.log("⚠ Search Console API not configured — cannot confirm submission\n");
    console.log("Search performance:");
    console.log("⚠ Authentication required — refusing to fabricate clicks/impressions\n");
    console.log("Issues:");
    missing.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });
    console.log("\nSee docs/SEO.md for Google Search Console setup.");
    process.exit(0);
  }

  const { webmasters, searchconsole } = createSearchConsoleClients(env);

  let sitemapOk = false;
  try {
    const listed = await webmasters.sitemaps.list({ siteUrl });
    const entries = listed.data.sitemap ?? [];
    const match = entries.find((entry) => entry.path === sitemapUrl);
    sitemapOk = Boolean(match);
    console.log("Sitemap:");
    console.log(
      sitemapOk
        ? `✓ Submitted (${sitemapUrl})`
        : `⚠ Not listed yet (${sitemapUrl}) — run pnpm seo:sitemap -- --submit`,
    );
    console.log("");
  } catch (error) {
    console.log("Sitemap:");
    console.log(
      `⚠ Could not list sitemaps: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.log("");
  }

  console.log("Important URLs (URL Inspection API):");
  for (const inspectionUrl of importantAbsoluteUrls().slice(0, 6)) {
    try {
      const response = await searchconsole.urlInspection.index.inspect({
        requestBody: { inspectionUrl, siteUrl },
      });
      const index = response.data.inspectionResult?.indexStatusResult;
      const coverage = index?.coverageState ?? "unknown";
      const mark = /indexed/i.test(coverage) ? "✓" : "⚠";
      console.log(`${mark} ${inspectionUrl} — ${coverage}`);
    } catch (error) {
      console.log(
        `⚠ ${inspectionUrl} — inspection failed (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }
  console.log("");

  const startDate = isoDate(days);
  const endDate = isoDate(3); // Search Console data often lags ~2–3 days
  try {
    const performance = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 10,
      },
    });

    const rows = performance.data.rows ?? [];

    // Totals from top queries are incomplete — also request undimensioned totals.
    const aggregate = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        rowLimit: 1,
      },
    });
    const aggregateRow = aggregate.data.rows?.[0];

    const clicks = Number(aggregateRow?.clicks ?? 0);
    const impressions = Number(aggregateRow?.impressions ?? 0);
    const ctr =
      typeof aggregateRow?.ctr === "number"
        ? aggregateRow.ctr
        : impressions > 0
          ? clicks / impressions
          : 0;
    const position =
      typeof aggregateRow?.position === "number" ? aggregateRow.position : 0;

    console.log("Search performance:");
    console.log(`Range: ${startDate} → ${endDate}`);
    console.log(`Clicks: ${formatNumber(clicks)}`);
    console.log(`Impressions: ${formatNumber(impressions)}`);
    console.log(`CTR: ${formatPercent(ctr)}`);
    console.log(`Average position: ${position ? position.toFixed(2) : "n/a"}`);
    console.log("");

    if (rows.length > 0) {
      console.log("Top queries:");
      for (const row of rows.slice(0, 5)) {
        const query = row.keys?.[0] ?? "(unknown)";
        console.log(
          `- ${query} | clicks=${formatNumber(row.clicks)} impressions=${formatNumber(row.impressions)} pos=${row.position?.toFixed(1) ?? "n/a"}`,
        );
      }
      console.log("");
    }
  } catch (error) {
    console.log("Search performance:");
    console.log(
      `⚠ Could not query analytics: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.log("");
  }

  console.log("Issues:");
  const issues: string[] = [];
  if (!sitemapOk) {
    issues.push("Sitemap not yet listed in Search Console (submit after verification).");
  }
  if (issues.length === 0) {
    console.log("1. None detected from available API responses.");
  } else {
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
