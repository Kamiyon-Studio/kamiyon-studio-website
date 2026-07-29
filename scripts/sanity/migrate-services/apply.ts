/**
 * Apply migration plan mutations (only when CLI passes `--apply`).
 * Idempotent: createOrReplace targets; delete ignores missing docs.
 */

import type { SanityClient } from "@sanity/client";

import { TARGET_SERVICES } from "./matrix";
import type { MigrationPlan, MigrationPlanOp } from "./types";

export type ApplyDeps = {
  client: SanityClient;
  log?: (message: string) => void;
};

function stubServiceDocument(slug: string): {
  _id: string;
  _type: "service";
  [key: string]: unknown;
} {
  const meta = TARGET_SERVICES.find((s) => s.slug === slug);
  if (!meta) {
    throw new Error(`No Gate 0 stub metadata for slug "${slug}"`);
  }

  const summary =
    `${meta.title}: ${meta.tagline} (placeholder — content owned by WS-B seed).`;

  return {
    _id: `service-${slug}`,
    _type: "service",
    title: meta.title,
    slug: { _type: "slug", current: slug },
    tagline: meta.tagline,
    summary,
    body: [
      {
        _type: "block",
        _key: `migrate-${slug}`,
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: `migrate-${slug}-span`,
            text: summary,
            marks: [],
          },
        ],
      },
    ],
    capabilities: [],
    order: meta.order,
    isPlaceholder: true,
    seo: {
      title: meta.title,
      description: meta.tagline,
    },
  };
}

async function deleteIfExists(
  client: SanityClient,
  id: string,
): Promise<boolean> {
  try {
    await client.delete(id);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Idempotent: missing doc is OK
    if (/not found|does not exist/i.test(message)) {
      return false;
    }
    throw error;
  }
}

async function applyOp(
  client: SanityClient,
  op: MigrationPlanOp,
  log: (message: string) => void,
): Promise<void> {
  switch (op.kind) {
    case "keep":
    case "preserve-case-study":
      log(`  · skip ${op.summary}`);
      return;

    case "create":
    case "rename": {
      const slug = op.newSlug;
      if (!slug) {
        throw new Error(`Missing newSlug for ${op.kind}`);
      }
      await client.createOrReplace(stubServiceDocument(slug));
      log(`  ✓ upsert service-${slug}`);
      if (op.kind === "rename" && op.oldId) {
        await deleteIfExists(client, op.oldId);
        log(`  ✓ delete ${op.oldId}`);
      }
      return;
    }

    case "merge": {
      // Target created via create op; only delete source here.
      if (op.oldId) {
        await deleteIfExists(client, op.oldId);
        log(`  ✓ delete merged source ${op.oldId}`);
      }
      return;
    }

    case "delete-service":
    case "delete-category": {
      if (op.oldId) {
        await deleteIfExists(client, op.oldId);
        log(`  ✓ delete ${op.oldId}`);
      }
      return;
    }

    case "reassign-ref": {
      if (!op.fromId || !op.newId || !op.oldId) {
        throw new Error(`Incomplete reassign-ref op: ${op.summary}`);
      }
      // Best-effort: patch common `category` / `service` reference fields.
      // Nested array paths are reported for humans; apply uses unset+set on
      // top-level service when present.
      const doc = await client.getDocument(op.fromId);
      if (!doc) {
        log(`  · skip reassign — missing ${op.fromId}`);
        return;
      }
      if (
        doc.service &&
        typeof doc.service === "object" &&
        "_ref" in doc.service &&
        (doc.service as { _ref?: string })._ref === op.oldId
      ) {
        await client
          .patch(op.fromId)
          .set({ service: { _type: "reference", _ref: op.newId } })
          .commit();
        log(`  ✓ reassign ${op.fromId}.service → ${op.newId}`);
        return;
      }
      log(
        `  · reassign recorded for ${op.fromId} (${op.path}) — manual follow-up if nested`,
      );
      return;
    }

    default: {
      const _exhaustive: never = op.kind;
      throw new Error(`Unknown op kind: ${_exhaustive}`);
    }
  }
}

/**
 * Apply plan in a safe order: creates/renames → reassigns → merges/deletes.
 */
export async function applyMigrationPlan(
  plan: MigrationPlan,
  deps: ApplyDeps,
): Promise<{ applied: number }> {
  const log = deps.log ?? console.log;
  const { client } = deps;

  const order: MigrationPlanOp["kind"][] = [
    "create",
    "rename",
    "keep",
    "reassign-ref",
    "merge",
    "delete-service",
    "delete-category",
    "preserve-case-study",
  ];

  const sorted = [...plan.ops].sort(
    (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind),
  );

  let applied = 0;
  for (const op of sorted) {
    await applyOp(client, op, log);
    if (
      op.kind !== "keep" &&
      op.kind !== "preserve-case-study"
    ) {
      applied += 1;
    }
  }

  return { applied };
}
