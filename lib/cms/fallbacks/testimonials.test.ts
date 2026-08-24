import { describe, expect, it } from "vitest";

import { teamMembersFallback } from "./about";
import {
  resolveHomeTestimonials,
  testimonialsFallback,
} from "./testimonials";
import type { Testimonial } from "../types";

function makeCmsQuote(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    _type: "testimonial",
    id: "testimonial-cms",
    quote: "A consented quote from Studio.",
    name: "Studio Partner",
    role: "Collaborator",
    order: 1,
    ...overrides,
  };
}

describe("testimonialsFallback", () => {
  it("uses every current team member name and role, in roster order", () => {
    expect(testimonialsFallback.map((item) => item.name)).toEqual(
      teamMembersFallback.map((member) => member.name),
    );
    expect(testimonialsFallback.map((item) => item.role)).toEqual(
      teamMembersFallback.map((member) => member.role),
    );
    expect(testimonialsFallback).toHaveLength(6);
  });

  it("gives each person a unique non-empty quote and a stable testimonial id", () => {
    const quotes = testimonialsFallback.map((item) => item.quote.trim());
    expect(quotes.every((quote) => quote.length > 0)).toBe(true);
    expect(new Set(quotes).size).toBe(quotes.length);

    expect(testimonialsFallback.map((item) => item.id)).toEqual([
      "testimonial-sherwin-limosnero",
      "testimonial-christian-jude-villaber",
      "testimonial-ken-cabingas",
      "testimonial-luis-cabrido-iii",
      "testimonial-lucky-guevarra",
      "testimonial-yushua-dapilaga",
    ]);
    expect(testimonialsFallback.every((item) => item._type === "testimonial")).toBe(
      true,
    );
    expect(testimonialsFallback.every((item) => item.photo === undefined)).toBe(
      true,
    );
  });
});

describe("resolveHomeTestimonials", () => {
  it("keeps CMS quotes when at least one exists", () => {
    const cms = [makeCmsQuote()];
    expect(resolveHomeTestimonials(cms)).toBe(cms);
  });

  it("uses the team-roster preview list when CMS is empty or missing", () => {
    expect(resolveHomeTestimonials([])).toBe(testimonialsFallback);
    expect(resolveHomeTestimonials(null)).toBe(testimonialsFallback);
    expect(resolveHomeTestimonials(undefined)).toBe(testimonialsFallback);
  });
});
