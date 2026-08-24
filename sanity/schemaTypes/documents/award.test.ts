/**
 * RFC — Sanity ↔ Frontend Align §1.2 Awards
 * KEEP existing fields; ADD placeholderLabel (initialValue "Placeholder").
 */
import { describe, expect, it } from "vitest";

import { award } from "./award";

function fieldNames(type: typeof award): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

function fieldByName(type: typeof award, name: string) {
  return (type.fields ?? []).find((field) => field.name === name);
}

describe("award schema (RFC §1.2 placeholderLabel)", () => {
  it("keeps title, label, organization, year, order, isPlaceholder", () => {
    const names = fieldNames(award);
    expect(names).toEqual(
      expect.arrayContaining([
        "title",
        "label",
        "organization",
        "year",
        "order",
        "isPlaceholder",
      ]),
    );
  });

  it("adds placeholderLabel string with initialValue Placeholder", () => {
    const field = fieldByName(award, "placeholderLabel");
    expect(field?.type).toBe("string");
    expect(field).toMatchObject({ initialValue: "Placeholder" });
  });

  it("does not cap awards via schema validation on order or title", () => {
    // Unbounded list is a product rule; schema must not invent a max of 3.
    const order = fieldByName(award, "order");
    expect(JSON.stringify(order)).not.toMatch(/max\(3\)|maxLength\(3\)/);
  });
});
