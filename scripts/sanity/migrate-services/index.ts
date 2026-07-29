#!/usr/bin/env node
/**
 * Five-service taxonomy migration (WS-C).
 *
 * Usage:
 *   pnpm tsx scripts/sanity/migrate-services/index.ts
 *   pnpm tsx scripts/sanity/migrate-services/index.ts --dry-run
 *   pnpm tsx scripts/sanity/migrate-services/index.ts --apply
 *   pnpm tsx scripts/sanity/migrate-services/index.ts --apply --allow-prod
 *
 * Dry-run is the DEFAULT. Do not `--apply` on prod until Gate 2 + human approval.
 */

import { loadEnvFiles } from "../seed/load-env";
import { parseMigrateArgs, runMigration } from "./run";

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  loadEnvFiles();
  const options = parseMigrateArgs(argv);

  try {
    const result = await runMigration(options);
    if (result.dryRun) {
      console.log(
        `[sanity:migrate-services] STATUS summary: ${result.statusSummary}`,
      );
    }
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sanity:migrate-services] ${message}`);
    return 1;
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  (process.argv[1].endsWith("scripts/sanity/migrate-services/index.ts") ||
    process.argv[1].endsWith("scripts\\sanity\\migrate-services\\index.ts") ||
    process.argv[1].includes("sanity/migrate-services/index"));

if (isDirectRun) {
  main().then((code) => {
    process.exit(code);
  });
}

export { main };
export { parseMigrateArgs, runMigration } from "./run";
export {
  planMigration,
  gate0ExpectedInventory,
  liveExtendedInventory,
  UnknownServiceSlugError,
  UnknownCategorySlugError,
  UnmappedDeleteReferenceError,
} from "./plan";
export { assertApplyAllowed, isProtectedDataset } from "./args";
