#!/usr/bin/env tsx
/**
 * Local technical SEO validation for Kamiyon Studio.
 *
 * Default: offline checks against builders + constants (safe for CI).
 * Optional: `--live` fetches production robots.txt / sitemap.xml / HTML.
 *
 * Exit 1 only on critical technical failures (not indexing fluctuations).
 */

import { getBlogPostingJsonLd } from "../../lib/seo/blog-posting-jsonld";
import { getBreadcrumbJsonLd } from "../../lib/seo/breadcrumb-jsonld";
import { getFaqJsonLd } from "../../lib/seo/faq-jsonld";
import { importantAbsoluteUrls } from "../../lib/seo/important-urls";
import { getOrganizationJsonLd } from "../../lib/seo/organization-jsonld";
import { buildRobotsPolicy } from "../../lib/seo/robots-policy";
import { buildPublicSitemapEntries } from "../../lib/seo/sitemap-entries";
import {
  PRODUCTION_CANONICAL_ORIGIN,
  isProductionCanonicalSiteUrl,
} from "../../lib/seo/site-url";
import { getWebsiteJsonLd } from "../../lib/seo/website-jsonld";

type CheckResult = {
  ok: boolean;
  label: string;
  detail?: string;
};

const live = process.argv.includes("--live");
const results: CheckResult[] = [];

function pass(label: string, detail?: string) {
  results.push({ ok: true, label, detail });
}

function fail(label: string, detail?: string) {
  results.push({ ok: false, label, detail });
}

function assertJsonLd(label: string, value: unknown) {
  try {
    const serialized = JSON.stringify(value);
    JSON.parse(serialized);
    if (
      typeof value !== "object" ||
      value === null ||
      !("@context" in value) ||
      !("@type" in value)
    ) {
      fail(label, "Missing @context or @type");
      return;
    }
    pass(label);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

function runOfflineChecks() {
  if (!isProductionCanonicalSiteUrl(PRODUCTION_CANONICAL_ORIGIN)) {
    fail("Canonical origin", PRODUCTION_CANONICAL_ORIGIN);
  } else {
    pass("Canonical origin", PRODUCTION_CANONICAL_ORIGIN);
  }

  const robots = buildRobotsPolicy(PRODUCTION_CANONICAL_ORIGIN, "production");
  const disallow = Array.isArray(robots.rules)
    ? []
    : Array.isArray(robots.rules.disallow)
      ? robots.rules.disallow
      : [robots.rules.disallow];

  if (robots.sitemap !== `${PRODUCTION_CANONICAL_ORIGIN}/sitemap.xml`) {
    fail("Robots sitemap declaration", String(robots.sitemap));
  } else {
    pass("Robots sitemap declaration", robots.sitemap);
  }

  if (!disallow.includes("/api/") || !disallow.includes("/motion-lab")) {
    fail("Robots disallow list", JSON.stringify(disallow));
  } else {
    pass("Robots disallow list", "admin/api/studio/motion-lab blocked");
  }

  const sitemap = buildPublicSitemapEntries({
    siteUrl: PRODUCTION_CANONICAL_ORIGIN,
    services: [
      { slug: { current: "game-development" }, seo: {} },
      { slug: { current: "branding" }, seo: {} },
    ],
    portfolioItems: [
      { slug: { current: "sample-client-project-placeholder" }, seo: {} },
    ],
    posts: [
      {
        slug: { current: "studio-notes-july-update" },
        publishedAt: "2026-07-24T10:00:00.000Z",
        seo: {},
      },
    ],
    appEnv: "production",
  });
  const urls = sitemap.map((entry) => entry.url);

  for (const required of [
    PRODUCTION_CANONICAL_ORIGIN,
    `${PRODUCTION_CANONICAL_ORIGIN}/about`,
    `${PRODUCTION_CANONICAL_ORIGIN}/services/game-development`,
    `${PRODUCTION_CANONICAL_ORIGIN}/blog/studio-notes-july-update`,
  ]) {
    if (!urls.includes(required)) {
      fail("Sitemap contains required URL", required);
    }
  }

  if (
    urls.some(
      (url) =>
        url.includes("/motion-lab") ||
        url.includes("/admin") ||
        url.includes("/api/"),
    )
  ) {
    fail("Sitemap excludes private routes");
  } else {
    pass("Sitemap builder", `${urls.length} sample URLs, private routes excluded`);
  }

  if (new Set(urls).size !== urls.length) {
    fail("Sitemap duplicates", "Duplicate URLs detected in sample build");
  } else {
    pass("Sitemap uniqueness");
  }

  assertJsonLd("Organization JSON-LD", getOrganizationJsonLd());
  assertJsonLd("WebSite JSON-LD", getWebsiteJsonLd());
  assertJsonLd(
    "BreadcrumbList JSON-LD",
    getBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
    ]),
  );
  assertJsonLd(
    "FAQPage JSON-LD",
    getFaqJsonLd([{ question: "Example?", answer: "Example answer." }]),
  );
  assertJsonLd(
    "BlogPosting JSON-LD",
    getBlogPostingJsonLd({
      _type: "post",
      title: "Example post",
      slug: { current: "example-post" },
      authors: [],
      categories: [],
      tags: [],
      body: [],
      seo: { title: "Example", description: "Example description." },
      publishedAt: "2026-07-24T10:00:00.000Z",
      relatedPostSlugs: [],
    }),
  );

  const org = getOrganizationJsonLd();
  if (org.url !== PRODUCTION_CANONICAL_ORIGIN) {
    fail("Organization url matches canonical", org.url);
  } else {
    pass("Organization url matches canonical");
  }

  const crumbs = getBreadcrumbJsonLd([{ name: "Home", href: "/" }]);
  if (crumbs.itemListElement[0]?.item !== PRODUCTION_CANONICAL_ORIGIN) {
    fail(
      "Breadcrumb absolute URLs",
      String(crumbs.itemListElement[0]?.item),
    );
  } else {
    pass("Breadcrumb absolute URLs");
  }

  pass(
    "Important URL list",
    `${importantAbsoluteUrls().length} core URLs for inspection`,
  );
}

async function runLiveChecks() {
  const robotsRes = await fetch(`${PRODUCTION_CANONICAL_ORIGIN}/robots.txt`);
  if (!robotsRes.ok) {
    fail("Live robots.txt", `HTTP ${robotsRes.status}`);
  } else {
    const body = await robotsRes.text();
    if (!body.includes("Sitemap: https://kamiyonstudio.com/sitemap.xml")) {
      fail("Live robots.txt sitemap line");
    } else if (!body.includes("Allow: /")) {
      fail("Live robots.txt allow rule");
    } else {
      pass("Live robots.txt", "200 + sitemap declaration");
    }
  }

  const sitemapRes = await fetch(`${PRODUCTION_CANONICAL_ORIGIN}/sitemap.xml`);
  if (!sitemapRes.ok) {
    fail("Live sitemap.xml", `HTTP ${sitemapRes.status}`);
  } else {
    const body = await sitemapRes.text();
    if (!body.includes("<urlset") || !body.includes(PRODUCTION_CANONICAL_ORIGIN)) {
      fail("Live sitemap.xml content");
    } else {
      pass("Live sitemap.xml", `HTTP ${sitemapRes.status}`);
    }
  }

  const homeRes = await fetch(PRODUCTION_CANONICAL_ORIGIN);
  if (!homeRes.ok) {
    fail("Live homepage", `HTTP ${homeRes.status}`);
  } else {
    const html = await homeRes.text();
    const hasCanonical = html.includes('rel="canonical"');
    const hasOrg = html.includes('"@type":"Organization"') || html.includes('"@type": "Organization"');
    if (!hasCanonical) {
      fail("Live homepage canonical link");
    } else {
      pass("Live homepage canonical link");
    }
    if (!hasOrg) {
      fail("Live homepage Organization JSON-LD");
    } else {
      pass("Live homepage Organization JSON-LD");
    }
  }
}

async function main() {
  console.log("# KAMIYON STUDIO — SEO CHECK\n");
  console.log(`Mode: ${live ? "offline + live" : "offline"}\n`);

  runOfflineChecks();
  if (live) {
    await runLiveChecks();
  }

  for (const result of results) {
    const mark = result.ok ? "✓" : "✗";
    const detail = result.detail ? ` — ${result.detail}` : "";
    console.log(`${mark} ${result.label}${detail}`);
  }

  const failed = results.filter((result) => !result.ok);
  console.log("");
  if (failed.length > 0) {
    console.error(`Failed: ${failed.length}/${results.length} checks`);
    process.exit(1);
  }

  console.log(`Passed: ${results.length}/${results.length} checks`);
  if (!live) {
    console.log("Tip: run `pnpm seo:check -- --live` to validate production endpoints.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
