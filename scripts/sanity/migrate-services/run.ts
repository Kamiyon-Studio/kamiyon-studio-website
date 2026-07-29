/**
 * Migration runner: discover → plan → dry-run report | apply.
 * Dry-run is the default. Never mutates without explicit `--apply`.
 */

import { dataset as defaultDataset, projectId as defaultProjectId } from "@/sanity/env";

import { assertApplyAllowed, parseMigrateArgs } from "./args";
import { applyMigrationPlan } from "./apply";
import {
  createMigrateReadClient,
  discoverInventory,
  type DiscoverDeps,
} from "./discover";
import { planMigration } from "./plan";
import { formatPlanReport, summarizePlanForStatus } from "./report";
import type { MigrateCliOptions, MigrationInventory, MigrationPlan } from "./types";
import { resolveWriteToken, WRITE_TOKEN_ENV } from "../seed/client";
import { createSeedWriteClient } from "../seed/client";

export type MigrateRunResult = {
  dryRun: boolean;
  applied: boolean;
  projectId: string;
  dataset: string;
  plan: MigrationPlan;
  statusSummary: string;
  report: string;
};

export type MigrateRunDeps = {
  discover?: () => Promise<MigrationInventory>;
  log?: (message: string) => void;
  resolveToken?: () => string | undefined;
  applyPlan?: typeof applyMigrationPlan;
  createWriteClient?: typeof createSeedWriteClient;
};

export { parseMigrateArgs };

/**
 * Run migration. Defaults to dry-run.
 * `--apply` requires write token and passes prod guard.
 */
export async function runMigration(
  options: MigrateCliOptions,
  deps: MigrateRunDeps = {},
): Promise<MigrateRunResult> {
  const log = deps.log ?? console.log;
  const projectId = options.projectId ?? defaultProjectId;
  const datasetName = options.dataset ?? defaultDataset;

  assertApplyAllowed(options, datasetName);

  const discover =
    deps.discover ??
    (async () => {
      const client = createMigrateReadClient({
        projectId,
        dataset: datasetName,
        token: deps.resolveToken?.() ?? resolveWriteToken(),
      });
      return discoverInventory({ client });
    });

  const inventory = await discover();
  const plan = planMigration(inventory);
  const report = formatPlanReport(plan, {
    dryRun: options.dryRun,
    projectId,
    dataset: datasetName,
  });
  const statusSummary = summarizePlanForStatus(plan);

  log(report);

  if (options.dryRun || !options.apply) {
    return {
      dryRun: true,
      applied: false,
      projectId,
      dataset: datasetName,
      plan,
      statusSummary,
      report,
    };
  }

  const resolveToken = deps.resolveToken ?? resolveWriteToken;
  const token = resolveToken();
  if (!token) {
    throw new Error(
      `Missing ${WRITE_TOKEN_ENV}. Refusing to mutate dataset "${datasetName}". Re-run without --apply (dry-run) or set a write token.`,
    );
  }

  const writeClient = (deps.createWriteClient ?? createSeedWriteClient)({
    token,
    projectId,
    dataset: datasetName,
  });

  const apply = deps.applyPlan ?? applyMigrationPlan;
  log("[sanity:migrate-services] applying mutations…");
  const { applied } = await apply(plan, {
    client: writeClient,
    log,
  });
  log(`[sanity:migrate-services] applied ${applied} mutating ops`);

  return {
    dryRun: false,
    applied: true,
    projectId,
    dataset: datasetName,
    plan,
    statusSummary,
    report,
  };
}

/** Re-export discover helpers for CLI / tests. */
export type { DiscoverDeps };
