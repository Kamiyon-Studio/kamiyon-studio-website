#!/usr/bin/env node
/**
 * Upsert ONLY new portfolio case studies — does not touch homePage, Eclipse,
 * services, blog, or any other Sanity documents.
 *
 * Usage:
 *   pnpm sanity:seed:portfolio --dry-run
 *   pnpm sanity:seed:portfolio
 *   pnpm sanity:seed:portfolio --append-home   # also append missing refs on homePage
 *
 * Prefer this over `pnpm sanity:seed` when adding portfolio entries to a live dataset.
 */

import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";

import { buildPortfolioDocument } from "./builders/portfolio";
import { arrayKey, toReference } from "./helpers";
import { portfolioId } from "./ids";
import { loadEnvFiles } from "./load-env";
import { createSeedWriteClient, resolveWriteToken } from "./client";
import type { SeedDocument } from "./types";

/** Slugs added in the Vocabu / Debug.Log / Flappy Awie portfolio pass. */
export const NEW_PORTFOLIO_SLUGS = [
  "vocabu-wildlife-edition",
  "debug-log",
  "flappy-awie",
] as const;

export function buildNewPortfolioSeedDocuments(): SeedDocument[] {
  return portfolioItemsFallback
    .filter((item) =>
      NEW_PORTFOLIO_SLUGS.includes(
        item.slug.current as (typeof NEW_PORTFOLIO_SLUGS)[number],
      ),
    )
    .map(buildPortfolioDocument);
}

type PortfolioOnlyOptions = {
  dryRun: boolean;
  appendHome: boolean;
};

function parseArgs(argv: string[]): PortfolioOnlyOptions {
  const flags = new Set(argv);
  return {
    dryRun: flags.has("--dry-run") || flags.has("-n"),
    appendHome: flags.has("--append-home"),
  };
}

async function appendNewPortfolioRefsToHome(
  client: ReturnType<typeof createSeedWriteClient>,
): Promise<number> {
  const home = await client.fetch<{
    portfolioItems?: Array<{ _type: string; _ref: string; _key?: string }>;
  } | null>(`*[_id == "homePage"][0]{ portfolioItems }`);

  if (!home?.portfolioItems) {
    console.warn("[sanity:seed:portfolio] homePage missing or has no portfolioItems — skip append");
    return 0;
  }

  const existingRefs = new Set(
    home.portfolioItems.map((ref) => ref._ref).filter(Boolean),
  );
  const toAdd = NEW_PORTFOLIO_SLUGS.map((slug) => portfolioId(slug)).filter(
    (id) => !existingRefs.has(id),
  );

  if (toAdd.length === 0) {
    console.log("[sanity:seed:portfolio] homePage already lists all new portfolio refs");
    return 0;
  }

  const startIndex = home.portfolioItems.length;
  const appended = toAdd.map((id, index) =>
    toReference(id, arrayKey("portfolio", startIndex + index)),
  );

  await client
    .patch("homePage")
    .set({ portfolioItems: [...home.portfolioItems, ...appended] })
    .commit();

  console.log(
    `[sanity:seed:portfolio] appended ${toAdd.length} portfolio ref(s) to homePage: ${toAdd.join(", ")}`,
  );
  return toAdd.length;
}

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  loadEnvFiles();
  const options = parseArgs(argv);
  const docs = buildNewPortfolioSeedDocuments();

  console.log(
    `[sanity:seed:portfolio] ${docs.length} portfolio document(s) — Eclipse and other CMS docs are NOT modified`,
  );

  if (options.dryRun) {
    for (const doc of docs) {
      console.log(`  [dry-run] ${doc._id}\t${doc._type}`);
    }
    if (options.appendHome) {
      console.log("  [dry-run] would append missing new portfolio refs to homePage");
    }
    return 0;
  }

  const token = resolveWriteToken();
  if (!token) {
    console.error("[sanity:seed:portfolio] Missing SANITY_API_WRITE_TOKEN");
    return 1;
  }

  const client = createSeedWriteClient({ token });

  for (const doc of docs) {
    await client.createOrReplace(doc);
    console.log(`  ✓ ${doc._id}\t${doc._type}`);
  }

  if (options.appendHome) {
    await appendNewPortfolioRefsToHome(client);
  }

  console.log(`[sanity:seed:portfolio] upserted ${docs.length} portfolio document(s)`);
  return 0;
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  process.argv[1].includes("portfolio-only");

if (isDirectRun) {
  main().then((code) => process.exit(code));
}

export { main, parseArgs };
