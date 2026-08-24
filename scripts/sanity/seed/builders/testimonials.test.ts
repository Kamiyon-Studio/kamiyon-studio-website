import { describe, expect, it } from "vitest";

import { testimonialsFallback } from "@/lib/cms/fallbacks/testimonials";

import { testimonialId } from "../ids";
import {
  buildAllSeedDocuments,
  buildTestimonialDocument,
  buildTestimonialDocuments,
} from "./index";

describe("testimonial seed builders", () => {
  it("emits stable hyphen IDs that match the team-roster preview list", () => {
    const docs = buildTestimonialDocuments();

    expect(docs.map((d) => d._id)).toEqual([
      "testimonial-sherwin-limosnero",
      "testimonial-christian-jude-villaber",
      "testimonial-ken-cabingas",
      "testimonial-luis-cabrido-iii",
      "testimonial-lucky-guevarra",
      "testimonial-yushua-dapilaga",
    ]);
    expect(testimonialId("sherwin-limosnero")).toBe(
      "testimonial-sherwin-limosnero",
    );
    expect(testimonialsFallback.map((item) => item.id)).toEqual(
      docs.map((d) => d._id),
    );
  });

  it("copies quote, name, and role and skips photos", () => {
    for (const [index, doc] of buildTestimonialDocuments().entries()) {
      const source = testimonialsFallback[index]!;
      expect(doc).toMatchObject({
        _type: "testimonial",
        quote: source.quote,
        name: source.name,
        role: source.role,
        order: source.order,
      });
      expect(doc).not.toHaveProperty("photo");
    }
  });

  it("buildTestimonialDocument maps a single preview quote", () => {
    expect(buildTestimonialDocument(testimonialsFallback[0]!)).toEqual({
      _id: "testimonial-sherwin-limosnero",
      _type: "testimonial",
      quote: testimonialsFallback[0]!.quote,
      name: "Sherwin Limosnero",
      role: "Chief Executive Officer (CEO)",
      order: 1,
    });
  });

  it("seeds testimonials after awards and before blog in the full set", () => {
    const ids = buildAllSeedDocuments().map((d) => d._id);

    expect(ids.indexOf("award-slot-3")).toBeLessThan(
      ids.indexOf("testimonial-sherwin-limosnero"),
    );
    expect(ids.indexOf("testimonial-sherwin-limosnero")).toBeLessThan(
      ids.indexOf("post-coming-soon"),
    );
  });
});
