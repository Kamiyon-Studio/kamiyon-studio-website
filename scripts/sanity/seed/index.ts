#!/usr/bin/env node
/**
 * Sanity content seed CLI (WS8d).
 *
 * Usage:
 *   pnpm sanity:seed --dry-run   # print planned _id / _type (no mutations)
 *   pnpm sanity:seed             # createOrReplace ALL seed docs (destructive on live CMS)
 *
 * To add portfolio case studies without wiping homePage, Eclipse, blog, etc.:
 *   pnpm sanity:seed:portfolio
 *
 * Loads `.env` / `.env.local` when present. Never seeds media.
 */

import { parseSeedArgs, runSeed } from "./run";
import { loadEnvFiles } from "./load-env";

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  loadEnvFiles();
  const options = parseSeedArgs(argv);

  try {
    await runSeed(options);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sanity:seed] ${message}`);
    return 1;
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  (process.argv[1].endsWith("scripts/sanity/seed/index.ts") ||
    process.argv[1].endsWith("scripts\\sanity\\seed\\index.ts") ||
    process.argv[1].includes("sanity/seed/index"));

if (isDirectRun) {
  main().then((code) => {
    process.exit(code);
  });
}

export { main };
export { parseSeedArgs, runSeed } from "./run";
export { createSeedWriteClient, resolveWriteToken } from "./client";
export {
  buildAllSeedDocuments,
  buildCoreSeedDocuments,
  listAllSeedDocumentIds,
} from "./builders";
