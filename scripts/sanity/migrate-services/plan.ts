/**
 * Pure planner: inventory + Gate 0 matrix → migration ops.
 * Throws UnknownServiceSlugError when live content is outside the matrix.
 */

import {
  CATEGORY_SLUGS_TO_DELETE,
  CREATE_SLUGS,
  GATE0_CATEGORY_SLUGS_TO_DELETE,
  GATE0_SERVICE_REMAP,
  KNOWN_CATEGORY_SLUGS,
  KNOWN_SERVICE_SLUGS,
  OLD_SERVICE_REMAP,
  TARGET_SLUGS,
  resolveTargetSlug,
  serviceCategoryDocId,
  serviceDocId,
} from "./matrix";
import type {
  MigrationInventory,
  MigrationPlan,
  MigrationPlanOp,
} from "./types";

export class UnknownServiceSlugError extends Error {
  readonly unknownSlugs: string[];

  constructor(unknownSlugs: string[]) {
    const list = unknownSlugs.join(", ");
    super(
      `WS-C blocked: service slug(s) not in Gate 0 remap matrix: ${list}. Do not invent assignments — ask the integrator.`,
    );
    this.name = "UnknownServiceSlugError";
    this.unknownSlugs = unknownSlugs;
  }
}

export class UnknownCategorySlugError extends Error {
  readonly unknownSlugs: string[];

  constructor(unknownSlugs: string[]) {
    const list = unknownSlugs.join(", ");
    super(
      `WS-C blocked: serviceCategory slug(s) not in Gate 0 delete list: ${list}. Do not invent deletions — ask the integrator.`,
    );
    this.name = "UnknownCategorySlugError";
    this.unknownSlugs = unknownSlugs;
  }
}

export class UnmappedDeleteReferenceError extends Error {
  readonly refs: Array<{ fromId: string; refId: string; oldSlug: string }>;

  constructor(
    refs: Array<{ fromId: string; refId: string; oldSlug: string }>,
  ) {
    const detail = refs
      .map((r) => `${r.fromId} → ${r.refId} (${r.oldSlug})`)
      .join("; ");
    super(
      `WS-C blocked: references point at delete-without-merge services: ${detail}. Stop and ask — no single merge target.`,
    );
    this.name = "UnmappedDeleteReferenceError";
    this.refs = refs;
  }
}

function slugFromServiceId(id: string): string | undefined {
  if (id.startsWith("service-")) {
    return id.slice("service-".length);
  }
  return undefined;
}

/**
 * Build an idempotent migration plan from discovered CMS inventory.
 * Side-effect free — safe for unit tests and dry-run reporting.
 */
export function planMigration(inventory: MigrationInventory): MigrationPlan {
  const serviceBySlug = new Map(
    inventory.services.map((s) => [s.slug, s] as const),
  );
  const presentSlugs = new Set(inventory.services.map((s) => s.slug));

  const unknownSlugs = [...presentSlugs].filter(
    (slug) => !KNOWN_SERVICE_SLUGS.has(slug),
  );
  if (unknownSlugs.length > 0) {
    throw new UnknownServiceSlugError(unknownSlugs.sort());
  }

  const unknownCategories = inventory.categories
    .map((c) => c.slug)
    .filter((slug) => !KNOWN_CATEGORY_SLUGS.has(slug))
    .sort();
  if (unknownCategories.length > 0) {
    throw new UnknownCategorySlugError(unknownCategories);
  }

  const ops: MigrationPlanOp[] = [];

  // --- Creates (targets that are not produced solely by keep/rename) ---
  for (const slug of CREATE_SLUGS) {
    if (!presentSlugs.has(slug)) {
      ops.push({
        kind: "create",
        summary: `create service ${slug}`,
        newSlug: slug,
        newId: serviceDocId(slug),
      });
    }
  }

  // Rename target ui-design may also need create when source absent but target missing
  // (handled below via rename / create paths).

  // --- Per-old-slug actions ---
  for (const row of OLD_SERVICE_REMAP) {
    const existing = serviceBySlug.get(row.oldSlug);

    if (row.action === "keep") {
      if (existing) {
        ops.push({
          kind: "keep",
          summary: `keep/update service ${row.oldSlug}`,
          oldSlug: row.oldSlug,
          newSlug: row.newSlug,
          oldId: existing._id,
          newId: serviceDocId(row.newSlug ?? row.oldSlug),
        });
      } else if (!presentSlugs.has(row.oldSlug)) {
        // Already gone — ensure target exists
        const target = row.newSlug ?? row.oldSlug;
        if (!presentSlugs.has(target)) {
          ops.push({
            kind: "create",
            summary: `create service ${target} (keep source missing)`,
            newSlug: target,
            newId: serviceDocId(target),
          });
        }
      }
      continue;
    }

    if (row.action === "rename" && row.newSlug) {
      const targetExists = presentSlugs.has(row.newSlug);
      if (existing && !targetExists) {
        ops.push({
          kind: "rename",
          summary: `rename service ${row.oldSlug} → ${row.newSlug}`,
          oldSlug: row.oldSlug,
          newSlug: row.newSlug,
          oldId: existing._id,
          newId: serviceDocId(row.newSlug),
        });
      } else if (existing && targetExists) {
        ops.push({
          kind: "delete-service",
          summary: `delete obsolete service ${row.oldSlug} (rename target already present)`,
          oldSlug: row.oldSlug,
          oldId: existing._id,
          newSlug: row.newSlug,
        });
      } else if (!existing && !targetExists) {
        ops.push({
          kind: "create",
          summary: `create service ${row.newSlug} (rename source missing)`,
          newSlug: row.newSlug,
          newId: serviceDocId(row.newSlug),
        });
      }
      // else: only target exists → already renamed (idempotent no-op)
      continue;
    }

    if (row.action === "merge" && row.newSlug) {
      if (existing) {
        ops.push({
          kind: "merge",
          summary: `merge service ${row.oldSlug} → ${row.newSlug}`,
          oldSlug: row.oldSlug,
          newSlug: row.newSlug,
          oldId: existing._id,
          newId: serviceDocId(row.newSlug),
        });
      }
      // Ensure merge target exists (may already be in CREATE_SLUGS)
      if (
        !presentSlugs.has(row.newSlug) &&
        !ops.some((op) => op.kind === "create" && op.newSlug === row.newSlug)
      ) {
        ops.push({
          kind: "create",
          summary: `create service ${row.newSlug} (merge target)`,
          newSlug: row.newSlug,
          newId: serviceDocId(row.newSlug),
        });
      }
      continue;
    }

    if (row.action === "delete") {
      if (existing) {
        ops.push({
          kind: "delete-service",
          summary: `delete service ${row.oldSlug} (no merge target)`,
          oldSlug: row.oldSlug,
          oldId: existing._id,
        });
      }
    }
  }

  // --- Category deletes ---
  const categoryBySlug = new Map(
    inventory.categories.map((c) => [c.slug, c] as const),
  );
  for (const slug of CATEGORY_SLUGS_TO_DELETE) {
    const cat = categoryBySlug.get(slug);
    if (cat) {
      ops.push({
        kind: "delete-category",
        summary: `delete serviceCategory ${slug}`,
        oldSlug: slug,
        oldId: cat._id,
      });
    } else {
      // Also match by conventional ID if slug field missing but ID present
      const byId = inventory.categories.find(
        (c) => c._id === serviceCategoryDocId(slug),
      );
      if (byId) {
        ops.push({
          kind: "delete-category",
          summary: `delete serviceCategory ${slug}`,
          oldSlug: slug,
          oldId: byId._id,
        });
      }
    }
  }

  // --- Reference reassignment ---
  const deleteWithoutMergeIds = new Set(
    OLD_SERVICE_REMAP.filter((r) => r.action === "delete").map((r) =>
      serviceDocId(r.oldSlug),
    ),
  );

  const blockedRefs: Array<{ fromId: string; refId: string; oldSlug: string }> =
    [];

  for (const hit of inventory.serviceReferences) {
    const oldSlug =
      slugFromServiceId(hit.refId) ??
      inventory.services.find((s) => s._id === hit.refId)?.slug;
    if (!oldSlug) {
      continue;
    }

    if (deleteWithoutMergeIds.has(hit.refId) || deleteWithoutMergeIds.has(serviceDocId(oldSlug))) {
      const row = OLD_SERVICE_REMAP.find((r) => r.oldSlug === oldSlug);
      if (row?.action === "delete") {
        blockedRefs.push({
          fromId: hit.fromId,
          refId: hit.refId,
          oldSlug,
        });
        continue;
      }
    }

    const targetSlug = resolveTargetSlug(oldSlug);
    if (targetSlug === null) {
      blockedRefs.push({
        fromId: hit.fromId,
        refId: hit.refId,
        oldSlug,
      });
      continue;
    }

    const newId = serviceDocId(targetSlug);
    if (hit.refId === newId) {
      continue; // already points at target
    }

    ops.push({
      kind: "reassign-ref",
      summary: `reassign ${hit.fromType}:${hit.fromId} ${hit.path} ${hit.refId} → ${newId}`,
      oldId: hit.refId,
      newId,
      oldSlug,
      newSlug: targetSlug,
      fromId: hit.fromId,
      path: hit.path,
    });
  }

  if (blockedRefs.length > 0) {
    throw new UnmappedDeleteReferenceError(blockedRefs);
  }

  // --- Case studies: preserve; reassign only when they carry service refs ---
  for (const cs of inventory.caseStudies) {
    if (cs.serviceRefIds.length === 0) {
      ops.push({
        kind: "preserve-case-study",
        summary: `preserve caseStudy ${cs.slug} (no service refs)`,
        oldId: cs._id,
        oldSlug: cs.slug,
      });
      continue;
    }

    for (const refId of cs.serviceRefIds) {
      const oldSlug =
        slugFromServiceId(refId) ??
        inventory.services.find((s) => s._id === refId)?.slug;
      if (!oldSlug) {
        continue;
      }
      const targetSlug = resolveTargetSlug(oldSlug);
      if (targetSlug === null) {
        throw new UnmappedDeleteReferenceError([
          { fromId: cs._id, refId, oldSlug },
        ]);
      }
      const newId = serviceDocId(targetSlug);
      if (refId !== newId) {
        ops.push({
          kind: "reassign-ref",
          summary: `reassign caseStudy ${cs.slug} service ref ${refId} → ${newId}`,
          oldId: refId,
          newId,
          oldSlug,
          newSlug: targetSlug,
          fromId: cs._id,
          path: "service",
        });
      }
    }
    ops.push({
      kind: "preserve-case-study",
      summary: `preserve caseStudy ${cs.slug} (client/content kept)`,
      oldId: cs._id,
      oldSlug: cs.slug,
    });
  }

  const mutating = ops.filter(
    (op) =>
      op.kind !== "keep" &&
      op.kind !== "preserve-case-study",
  );

  const onlyFiveTargets =
    presentSlugs.size === TARGET_SLUGS.size &&
    [...TARGET_SLUGS].every((s) => presentSlugs.has(s));

  const alreadyMigrated =
    onlyFiveTargets &&
    inventory.categories.length === 0 &&
    mutating.length === 0;

  return {
    ops,
    alreadyMigrated,
    unknownSlugs: [],
  };
}

/** Gate 0 seed inventory (placeholders) — excludes live UUID extensions. */
export function gate0ExpectedInventory(): MigrationInventory {
  return {
    services: GATE0_SERVICE_REMAP.map((r) => ({
      _id: serviceDocId(r.oldSlug),
      slug: r.oldSlug,
    })),
    categories: GATE0_CATEGORY_SLUGS_TO_DELETE.map((slug) => ({
      _id: serviceCategoryDocId(slug),
      slug,
    })),
    caseStudies: [
      {
        _id: "caseStudy-sample-portfolio",
        slug: "sample-portfolio",
        serviceRefIds: [],
      },
    ],
    serviceReferences: [],
  };
}

/**
 * Live `kamiyon` shape at WS-C unblock: Gate 0 seed + approved UUID extensions.
 * IDs for live-only docs use conventional service-{slug} in unit tests;
 * discover uses real UUID `_id`s from Sanity.
 */
export function liveExtendedInventory(): MigrationInventory {
  return {
    services: OLD_SERVICE_REMAP.map((r) => ({
      _id: serviceDocId(r.oldSlug),
      slug: r.oldSlug,
    })),
    categories: CATEGORY_SLUGS_TO_DELETE.map((slug) => ({
      _id: serviceCategoryDocId(slug),
      slug,
    })),
    caseStudies: [
      {
        _id: "caseStudy-sample-portfolio",
        slug: "sample-portfolio",
        serviceRefIds: [],
      },
    ],
    serviceReferences: [],
  };
}
