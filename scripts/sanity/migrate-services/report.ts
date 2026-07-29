/**
 * Format dry-run / apply reports for WS-C.
 */

import type { MigrationPlan } from "./types";

export function formatPlanReport(
  plan: MigrationPlan,
  meta: {
    dryRun: boolean;
    projectId: string;
    dataset: string;
  },
): string {
  const lines: string[] = [];
  const mode = meta.dryRun ? "DRY-RUN" : "APPLY";
  lines.push(
    `[sanity:migrate-services] ${mode} project=${meta.projectId} dataset=${meta.dataset}`,
  );

  if (plan.alreadyMigrated) {
    lines.push("[sanity:migrate-services] already migrated — no mutating ops");
  }

  const groups: Array<{ title: string; kinds: string[] }> = [
    { title: "KEEP / UPDATE", kinds: ["keep"] },
    { title: "CREATE", kinds: ["create"] },
    { title: "RENAME", kinds: ["rename"] },
    { title: "MERGE", kinds: ["merge"] },
    { title: "DELETE SERVICES", kinds: ["delete-service"] },
    { title: "DELETE CATEGORIES", kinds: ["delete-category"] },
    { title: "REASSIGN REFS", kinds: ["reassign-ref"] },
    { title: "PRESERVE CASE STUDIES / CLIENTS", kinds: ["preserve-case-study"] },
  ];

  for (const group of groups) {
    const ops = plan.ops.filter((op) => group.kinds.includes(op.kind));
    if (ops.length === 0) {
      continue;
    }
    lines.push(`\n## ${group.title} (${ops.length})`);
    for (const op of ops) {
      lines.push(`  - ${op.summary}`);
    }
  }

  lines.push(
    `\n[sanity:migrate-services] total ops=${plan.ops.length} alreadyMigrated=${plan.alreadyMigrated}`,
  );
  if (meta.dryRun) {
    lines.push("[sanity:migrate-services] dry-run — no mutations applied");
  }
  return lines.join("\n");
}

/** Compact matrix-aligned summary for the WS-C status block. */
export function summarizePlanForStatus(plan: MigrationPlan): string {
  const count = (kind: string) =>
    plan.ops.filter((op) => op.kind === kind).length;

  const merges = plan.ops
    .filter((op) => op.kind === "merge")
    .map((op) => `${op.oldSlug}→${op.newSlug}`)
    .join(", ");
  const deletes = plan.ops
    .filter((op) => op.kind === "delete-service")
    .map((op) => op.oldSlug)
    .join(", ");
  const categories = plan.ops
    .filter((op) => op.kind === "delete-category")
    .map((op) => op.oldSlug)
    .join(", ");
  const creates = plan.ops
    .filter((op) => op.kind === "create")
    .map((op) => op.newSlug)
    .join(", ");
  const renames = plan.ops
    .filter((op) => op.kind === "rename")
    .map((op) => `${op.oldSlug}→${op.newSlug}`)
    .join(", ");

  return [
    `keep=${count("keep")}`,
    `create=[${creates}]`,
    `rename=[${renames}]`,
    `merge=[${merges}]`,
    `delete-services=[${deletes}]`,
    `delete-categories=[${categories}]`,
    `reassign-refs=${count("reassign-ref")}`,
    `preserve-case-studies=${count("preserve-case-study")}`,
    `alreadyMigrated=${plan.alreadyMigrated}`,
  ].join("; ");
}
