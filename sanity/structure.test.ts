import { describe, expect, it } from "vitest";

import {
  CANONICAL_SERVICES,
  SANITY_ARCHIVED_TYPES,
} from "./schemaTypes/constants";

describe("Studio structure — five services (Gate 0)", () => {
  it("lists exactly five canonical services in fixed order", () => {
    expect(CANONICAL_SERVICES).toHaveLength(5);
    expect(CANONICAL_SERVICES.map((s) => s.slug)).toEqual([
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]);
    expect(CANONICAL_SERVICES.map((s) => s.title)).toEqual([
      "Game Development",
      "Product Development",
      "UI & Design",
      "Branding",
      "Community & Events",
    ]);
    expect(CANONICAL_SERVICES.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("uses stable service-{slug} document IDs for desk items", () => {
    expect(CANONICAL_SERVICES.map((s) => s.documentId)).toEqual([
      "service-game-development",
      "service-product-development",
      "service-ui-design",
      "service-branding",
      "service-community-events",
    ]);
  });

  it("keeps serviceCategory archived (not a root desk collection)", () => {
    expect(SANITY_ARCHIVED_TYPES).toContain("serviceCategory");
  });

  it("exports a structure resolver that is a function", async () => {
    const { structure } = await import("./structure");
    expect(typeof structure).toBe("function");
  });
});
