/**
 * CLI argument parsing for WS-C migration.
 * Dry-run is the DEFAULT — mutations require explicit `--apply`.
 */

import type { MigrateCliOptions } from "./types";

/** Dataset names that require `--allow-prod` before `--apply`. */
export const PROTECTED_DATASETS = new Set([
  "production",
  "prod",
  "kamiyon", // live seeded dataset (ADR-011 / ADR-009 default)
]);

export function isProtectedDataset(dataset: string): boolean {
  return PROTECTED_DATASETS.has(dataset.trim().toLowerCase());
}

/**
 * Parse argv.
 * - Default: dry-run (no mutations)
 * - `--apply`: enable mutations (still blocked on protected datasets without `--allow-prod`)
 * - `--dry-run` / `-n`: force dry-run even if `--apply` is present
 * - `--allow-prod`: permit apply against protected datasets
 */
export function parseMigrateArgs(argv: string[]): MigrateCliOptions {
  const flags = new Set(argv);
  const forceDryRun = flags.has("--dry-run") || flags.has("-n");
  const apply = flags.has("--apply") && !forceDryRun;
  const allowProd = flags.has("--allow-prod");

  return {
    dryRun: !apply,
    apply,
    allowProd,
  };
}

export class ProdApplyBlockedError extends Error {
  constructor(dataset: string) {
    super(
      `Refusing --apply on protected dataset "${dataset}". Re-run with --dry-run (default), or pass --allow-prod only after Gate 2 + human approval.`,
    );
    this.name = "ProdApplyBlockedError";
  }
}

export function assertApplyAllowed(
  options: Pick<MigrateCliOptions, "apply" | "allowProd">,
  dataset: string,
): void {
  if (!options.apply) {
    return;
  }
  if (isProtectedDataset(dataset) && !options.allowProd) {
    throw new ProdApplyBlockedError(dataset);
  }
}
