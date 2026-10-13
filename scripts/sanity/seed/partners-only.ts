#!/usr/bin/env node
/**
 * Restore homePage partner refs only — does not touch portfolio, awards, services,
 * or other homePage fields. Does not replace partner documents (restore logos via
 * Studio History on each partner doc).
 *
 * Usage:
 *   pnpm sanity:seed:partners --dry-run
 *   pnpm sanity:seed:partners
 *   pnpm sanity:seed:partners --force   # overwrite existing partner refs
 */

import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";

import { arrayKey, toReference } from "./helpers";
import { partnerId } from "./ids";
import { loadEnvFiles } from "./load-env";
import { createSeedWriteClient, resolveWriteToken } from "./client";
import type { SanityReference } from "./types";

export function buildHomePartnerReferences(): SanityReference[] {
  return PARTNER_PLACEHOLDERS.map((placeholder, index) =>
    toReference(partnerId(placeholder.id), arrayKey("partner", index)),
  );
}

type PartnersOnlyOptions = {
  dryRun: boolean;
  force: boolean;
};

function parseArgs(argv: string[]): PartnersOnlyOptions {
  const flags = new Set(argv);
  return {
    dryRun: flags.has("--dry-run") || flags.has("-n"),
    force: flags.has("--force"),
  };
}

async function restorePartnersOnHome(
  client: ReturnType<typeof createSeedWriteClient>,
  options: Pick<PartnersOnlyOptions, "force">,
): Promise<number> {
  const home = await client.fetch<{
    partners?: SanityReference[] | null;
  } | null>(`*[_id == "homePage"][0]{ partners }`);

  if (!home) {
    console.warn("[sanity:seed:partners] homePage missing — skip");
    return 0;
  }

  const existingCount = home.partners?.length ?? 0;
  if (!options.force && existingCount > 0) {
    console.log(
      `[sanity:seed:partners] homePage already has ${existingCount} partner ref(s) — skip (use --force to replace)`,
    );
    return 0;
  }

  const partners = buildHomePartnerReferences();

  await client.patch("homePage").set({ partners }).commit();

  console.log(
    `[sanity:seed:partners] set homePage.partners (${partners.length} ref(s)): ${partners
      .map((ref) => ref._ref)
      .join(", ")}`,
  );
  return partners.length;
}

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  loadEnvFiles();
  const options = parseArgs(argv);
  const refs = buildHomePartnerReferences();

  console.log(
    `[sanity:seed:partners] will link ${refs.length} partner ref(s) on homePage — partner documents are NOT modified`,
  );

  if (options.dryRun) {
    for (const ref of refs) {
      console.log(`  [dry-run] ${ref._ref}`);
    }
    return 0;
  }

  const token = resolveWriteToken();
  if (!token) {
    console.error("[sanity:seed:partners] Missing SANITY_API_WRITE_TOKEN");
    return 1;
  }

  const client = createSeedWriteClient({ token });
  await restorePartnersOnHome(client, { force: options.force });
  return 0;
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  process.argv[1].includes("partners-only");

if (isDirectRun) {
  main().then((code) => process.exit(code));
}

export { main, parseArgs, restorePartnersOnHome };
