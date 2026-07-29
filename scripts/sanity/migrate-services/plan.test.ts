import { describe, expect, it } from "vitest";

import {
  CATEGORY_SLUGS_TO_DELETE,
  CREATE_SLUGS,
  GATE0_CATEGORY_SLUGS_TO_DELETE,
  LIVE_CATEGORY_SLUGS_TO_DELETE,
  LIVE_SERVICE_REMAP_EXTENSIONS,
  OLD_SERVICE_REMAP,
  TARGET_SERVICES,
  resolveTargetSlug,
  serviceDocId,
} from "./matrix";
import {
  UnknownCategorySlugError,
  UnknownServiceSlugError,
  UnmappedDeleteReferenceError,
  gate0ExpectedInventory,
  liveExtendedInventory,
  planMigration,
} from "./plan";
import type { MigrationInventory } from "./types";

describe("Gate 0 remap matrix", () => {
  it("locks exactly five target services in fixed order", () => {
    expect(TARGET_SERVICES.map((s) => s.slug)).toEqual([
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]);
    expect(TARGET_SERVICES.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("maps merge/rename/delete/keep per Gate 0 matrix", () => {
    expect(resolveTargetSlug("game-development")).toBe("game-development");
    expect(resolveTargetSlug("mvp-development")).toBe("product-development");
    expect(resolveTargetSlug("web-development")).toBe("product-development");
    expect(resolveTargetSlug("mobile-development")).toBe("product-development");
    expect(resolveTargetSlug("ai-integration")).toBe("product-development");
    expect(resolveTargetSlug("gamification")).toBe("game-development");
    expect(resolveTargetSlug("ui-ux-design")).toBe("ui-design");
    expect(resolveTargetSlug("creative-services")).toBeNull();
    expect(resolveTargetSlug("blockchain-solutions")).toBeNull();
    expect(resolveTargetSlug("consultation")).toBeNull();
  });

  it("maps human-approved live extensions (2026-07-29)", () => {
    expect(resolveTargetSlug("community-growth-management")).toBe(
      "community-events",
    );
    expect(resolveTargetSlug("creative-direction-branding")).toBe("branding");
    expect(resolveTargetSlug("game-dev")).toBe("game-development");
    expect(
      LIVE_SERVICE_REMAP_EXTENSIONS.map((r) => r.oldSlug).sort(),
    ).toEqual([
      "community-growth-management",
      "creative-direction-branding",
      "game-dev",
    ].sort());
  });

  it("lists Gate 0 ×4 + live extra categories and three pure creates", () => {
    expect([...GATE0_CATEGORY_SLUGS_TO_DELETE]).toEqual([
      "interactive-experience-development",
      "software-development",
      "creative-design-services",
      "consulting-technical-advisory",
    ]);
    expect([...LIVE_CATEGORY_SLUGS_TO_DELETE]).toEqual([
      "community-building",
      "creative-direction",
      "game-development",
    ]);
    expect([...CATEGORY_SLUGS_TO_DELETE]).toEqual([
      ...GATE0_CATEGORY_SLUGS_TO_DELETE,
      ...LIVE_CATEGORY_SLUGS_TO_DELETE,
    ]);
    expect([...CREATE_SLUGS]).toEqual([
      "product-development",
      "branding",
      "community-events",
    ]);
  });
});

describe("planMigration", () => {
  it("plans Gate 0 expected inventory: merges, rename, deletes, creates, categories", () => {
    const plan = planMigration(gate0ExpectedInventory());

    const kindsBySlug = (kind: string, slug: string) =>
      plan.ops.filter((op) => op.kind === kind && (op.oldSlug === slug || op.newSlug === slug));

    expect(kindsBySlug("keep", "game-development")).toHaveLength(1);

    for (const old of [
      "mvp-development",
      "web-development",
      "mobile-development",
      "ai-integration",
    ]) {
      const merge = plan.ops.find(
        (op) => op.kind === "merge" && op.oldSlug === old,
      );
      expect(merge?.newSlug).toBe("product-development");
    }

    expect(
      plan.ops.find((op) => op.kind === "merge" && op.oldSlug === "gamification")
        ?.newSlug,
    ).toBe("game-development");

    expect(
      plan.ops.find((op) => op.kind === "rename" && op.oldSlug === "ui-ux-design")
        ?.newSlug,
    ).toBe("ui-design");

    for (const old of [
      "creative-services",
      "blockchain-solutions",
      "consultation",
    ]) {
      expect(
        plan.ops.some(
          (op) => op.kind === "delete-service" && op.oldSlug === old,
        ),
      ).toBe(true);
    }

    for (const slug of CREATE_SLUGS) {
      expect(
        plan.ops.some((op) => op.kind === "create" && op.newSlug === slug),
      ).toBe(true);
    }

    for (const slug of GATE0_CATEGORY_SLUGS_TO_DELETE) {
      expect(
        plan.ops.some(
          (op) => op.kind === "delete-category" && op.oldSlug === slug,
        ),
      ).toBe(true);
    }

    // Live-only categories absent from Gate 0 seed inventory → no delete ops yet
    for (const slug of LIVE_CATEGORY_SLUGS_TO_DELETE) {
      expect(
        plan.ops.some(
          (op) => op.kind === "delete-category" && op.oldSlug === slug,
        ),
      ).toBe(false);
    }

    expect(
      plan.ops.some(
        (op) =>
          op.kind === "preserve-case-study" && op.oldSlug === "sample-portfolio",
      ),
    ).toBe(true);

    expect(plan.alreadyMigrated).toBe(false);
  });

  it("reassigns references for merge and rename targets", () => {
    const inventory: MigrationInventory = {
      services: OLD_SERVICE_REMAP.map((r) => ({
        _id: serviceDocId(r.oldSlug),
        slug: r.oldSlug,
      })),
      categories: [],
      caseStudies: [],
      serviceReferences: [
        {
          fromId: "homePage",
          fromType: "homePage",
          path: "blocks[_key==\"x\"].featuredServices[0]",
          refId: serviceDocId("mvp-development"),
        },
        {
          fromId: "doc-a",
          fromType: "someType",
          path: "service",
          refId: serviceDocId("ui-ux-design"),
        },
        {
          fromId: "doc-b",
          fromType: "someType",
          path: "service",
          refId: serviceDocId("gamification"),
        },
      ],
    };

    const plan = planMigration(inventory);
    const reassigns = plan.ops.filter((op) => op.kind === "reassign-ref");

    expect(
      reassigns.find((op) => op.oldSlug === "mvp-development")?.newSlug,
    ).toBe("product-development");
    expect(reassigns.find((op) => op.oldSlug === "ui-ux-design")?.newSlug).toBe(
      "ui-design",
    );
    expect(reassigns.find((op) => op.oldSlug === "gamification")?.newSlug).toBe(
      "game-development",
    );
  });

  it("reassigns case study service refs when present", () => {
    const inventory: MigrationInventory = {
      services: [
        { _id: serviceDocId("web-development"), slug: "web-development" },
        {
          _id: serviceDocId("product-development"),
          slug: "product-development",
        },
      ],
      categories: [],
      caseStudies: [
        {
          _id: "caseStudy-acme",
          slug: "acme",
          serviceRefIds: [serviceDocId("web-development")],
        },
      ],
      serviceReferences: [],
    };

    const plan = planMigration(inventory);
    expect(
      plan.ops.some(
        (op) =>
          op.kind === "reassign-ref" &&
          op.fromId === "caseStudy-acme" &&
          op.newSlug === "product-development",
      ),
    ).toBe(true);
    expect(
      plan.ops.some(
        (op) => op.kind === "preserve-case-study" && op.oldSlug === "acme",
      ),
    ).toBe(true);
  });

  it("plans live-extended inventory: UUID merges + extra category deletes", () => {
    const plan = planMigration(liveExtendedInventory());

    expect(
      plan.ops.find(
        (op) =>
          op.kind === "merge" && op.oldSlug === "community-growth-management",
      )?.newSlug,
    ).toBe("community-events");
    expect(
      plan.ops.find(
        (op) =>
          op.kind === "merge" && op.oldSlug === "creative-direction-branding",
      )?.newSlug,
    ).toBe("branding");
    expect(
      plan.ops.find((op) => op.kind === "merge" && op.oldSlug === "game-dev")
        ?.newSlug,
    ).toBe("game-development");

    for (const slug of LIVE_CATEGORY_SLUGS_TO_DELETE) {
      expect(
        plan.ops.some(
          (op) => op.kind === "delete-category" && op.oldSlug === slug,
        ),
      ).toBe(true);
    }
    expect(plan.alreadyMigrated).toBe(false);
  });

  it("STOPS on unknown category slugs (no invented deletions)", () => {
    const inventory: MigrationInventory = {
      services: [
        { _id: serviceDocId("game-development"), slug: "game-development" },
      ],
      categories: [
        {
          _id: "serviceCategory-quantum-advisory",
          slug: "quantum-advisory",
        },
      ],
      caseStudies: [],
      serviceReferences: [],
    };

    expect(() => planMigration(inventory)).toThrow(UnknownCategorySlugError);
  });

  it("STOPS on unknown service slugs (no invented assignments)", () => {
    const inventory: MigrationInventory = {
      services: [
        { _id: serviceDocId("game-development"), slug: "game-development" },
        { _id: serviceDocId("quantum-consulting"), slug: "quantum-consulting" },
      ],
      categories: [],
      caseStudies: [],
      serviceReferences: [],
    };

    expect(() => planMigration(inventory)).toThrow(UnknownServiceSlugError);
    try {
      planMigration(inventory);
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownServiceSlugError);
      expect((error as UnknownServiceSlugError).unknownSlugs).toEqual([
        "quantum-consulting",
      ]);
    }
  });

  it("STOPS when refs point at delete-without-merge services", () => {
    const inventory: MigrationInventory = {
      services: [
        {
          _id: serviceDocId("creative-services"),
          slug: "creative-services",
        },
      ],
      categories: [],
      caseStudies: [],
      serviceReferences: [
        {
          fromId: "portfolio-1",
          fromType: "portfolio",
          path: "service",
          refId: serviceDocId("creative-services"),
        },
      ],
    };

    expect(() => planMigration(inventory)).toThrow(UnmappedDeleteReferenceError);
  });

  it("is idempotent when already on five-service flat state", () => {
    const inventory: MigrationInventory = {
      services: TARGET_SERVICES.map((s) => ({
        _id: serviceDocId(s.slug),
        slug: s.slug,
      })),
      categories: [],
      caseStudies: [
        {
          _id: "caseStudy-sample-portfolio",
          slug: "sample-portfolio",
          serviceRefIds: [],
        },
      ],
      serviceReferences: [],
    };

    const plan = planMigration(inventory);
    expect(plan.alreadyMigrated).toBe(true);
    expect(plan.ops.every((op) => op.kind === "keep" || op.kind === "preserve-case-study")).toBe(
      true,
    );
    expect(
      plan.ops.filter((op) => op.kind === "create" || op.kind === "delete-service"),
    ).toHaveLength(0);
  });

  it("deletes rename source when target already exists", () => {
    const inventory: MigrationInventory = {
      services: [
        { _id: serviceDocId("ui-ux-design"), slug: "ui-ux-design" },
        { _id: serviceDocId("ui-design"), slug: "ui-design" },
      ],
      categories: [],
      caseStudies: [],
      serviceReferences: [],
    };

    const plan = planMigration(inventory);
    expect(
      plan.ops.find(
        (op) => op.kind === "delete-service" && op.oldSlug === "ui-ux-design",
      ),
    ).toBeDefined();
    expect(
      plan.ops.some(
        (op) => op.kind === "rename" && op.oldSlug === "ui-ux-design",
      ),
    ).toBe(false);
  });
});
