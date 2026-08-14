import { describe, expect, it } from "vitest";

import { testimonial } from "./testimonial";

function fieldNames(type: typeof testimonial): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

function fieldByName(type: typeof testimonial, name: string) {
  return (type.fields ?? []).find((field) => field.name === name);
}

describe("testimonial schema", () => {
  it("exposes quote, name, role, photo, and order", () => {
    expect(fieldNames(testimonial)).toEqual(["quote", "name", "role", "photo", "order"]);
  });

  it("makes quote a required text field", () => {
    const quote = fieldByName(testimonial, "quote");
    expect(quote?.type).toBe("text");
    expect(quote?.validation).toBeTypeOf("function");
  });

  it("makes name a required string", () => {
    const name = fieldByName(testimonial, "name");
    expect(name?.type).toBe("string");
    expect(name?.validation).toBeTypeOf("function");
  });

  it("uses r2Asset for the optional photo", () => {
    const photo = fieldByName(testimonial, "photo");
    expect(photo?.type).toBe("r2Asset");
    expect(photo?.validation).toBeUndefined();
  });

  it("makes order a required number", () => {
    const order = fieldByName(testimonial, "order");
    expect(order?.type).toBe("number");
    expect(order?.validation).toBeTypeOf("function");
  });

  it("does not expose isPlaceholder", () => {
    expect(fieldNames(testimonial)).not.toContain("isPlaceholder");
  });
});
