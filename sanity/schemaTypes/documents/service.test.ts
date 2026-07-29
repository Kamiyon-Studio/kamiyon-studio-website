import { describe, expect, it } from "vitest";

import { CANONICAL_SERVICES } from "../constants";
import { service } from "./service";

function fieldNames(type: typeof service): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

function fieldByName(type: typeof service, name: string) {
  return (type.fields ?? []).find((field) => field.name === name);
}

describe("service schema (Gate 0 flat five)", () => {
  it("exposes tagline and capabilities; drops category and outcomes", () => {
    const names = fieldNames(service);

    expect(names).toContain("tagline");
    expect(names).toContain("capabilities");
    expect(names).toContain("summary");
    expect(names).toContain("body");
    expect(names).not.toContain("category");
    expect(names).not.toContain("outcomes");
  });

  it("keeps seo, order, and placeholder for Studio editors", () => {
    const names = fieldNames(service);

    expect(names).toContain("seo");
    expect(names).toContain("order");
    expect(names).toContain("isPlaceholder");
  });

  it("makes body optional and tagline a required string", () => {
    const tagline = fieldByName(service, "tagline");
    const body = fieldByName(service, "body");

    expect(tagline?.type).toBe("string");
    expect(tagline?.validation).toBeTypeOf("function");
    expect(body?.type).toBe("portableBody");
    // optional = no validation, or validation that is not required-only
    expect(body?.validation).toBeUndefined();
  });

  it("restricts slug values to the five Gate 0 slugs", () => {
    const slug = fieldByName(service, "slug");
    expect(slug?.validation).toBeTypeOf("function");

    const allowed = CANONICAL_SERVICES.map((entry) => entry.slug);
    expect(allowed).toEqual([
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]);
  });

  it("does not import obsolete category taxonomies", () => {
    // Structural: category field gone; preview uses tagline/order instead.
    expect(service.preview?.select).toMatchObject({
      title: "title",
    });
    expect(service.preview?.select).not.toHaveProperty("subtitle", "category");
  });
});
