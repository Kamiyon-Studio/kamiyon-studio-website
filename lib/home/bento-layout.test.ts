import { describe, expect, it } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import {
  BENTO_LARGE_SLOT_COUNT,
  BENTO_SMALL_SLOT_COUNT,
  partitionBentoLayout,
} from "./bento-layout";

function makeCaseStudy(overrides: Partial<CaseStudy> & { slug: string }): CaseStudy {
  const { slug, ...rest } = overrides;

  return {
    _type: "portfolio",
    title: "Case study",
    slug: { current: slug },
    clientName: "Client name coming soon",
    industry: "Interactive Experience",
  serviceType: "game-development",
    challenge: "",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
    ...rest,
  };
}

describe("partitionBentoLayout", () => {
  it("returns fixed large and small slot counts", () => {
    const layout = partitionBentoLayout([]);

    expect(layout.large).toHaveLength(BENTO_LARGE_SLOT_COUNT);
    expect(layout.small).toHaveLength(BENTO_SMALL_SLOT_COUNT);
    expect(BENTO_LARGE_SLOT_COUNT).toBe(2);
    expect(BENTO_SMALL_SLOT_COUNT).toBe(6);
  });

  it("fills large slots before small slots from available case studies", () => {
    const caseStudies = [
      makeCaseStudy({ slug: "first", title: "First" }),
      makeCaseStudy({ slug: "second", title: "Second" }),
      makeCaseStudy({ slug: "third", title: "Third" }),
    ];

    const layout = partitionBentoLayout(caseStudies);

    expect(layout.large.map((slot) => slot?.title)).toEqual(["First", "Second"]);
    expect(layout.small[0]?.title).toBe("Third");
    expect(layout.small.slice(1)).toEqual([null, null, null, null, null]);
  });

  it("prioritizes featured case studies before non-featured items", () => {
    const caseStudies = [
      makeCaseStudy({ slug: "regular", title: "Regular", featured: false }),
      makeCaseStudy({ slug: "featured", title: "Featured", featured: true }),
      makeCaseStudy({ slug: "another", title: "Another", featured: false }),
    ];

    const layout = partitionBentoLayout(caseStudies);

    expect(layout.large.map((slot) => slot?.slug.current)).toEqual(["featured", "regular"]);
    expect(layout.small[0]?.slug.current).toBe("another");
  });

  it("pads remaining slots with null when fewer than eight case studies exist", () => {
    const layout = partitionBentoLayout([
      makeCaseStudy({ slug: "only-one", title: "Only one" }),
    ]);

    expect(layout.large).toEqual([
      expect.objectContaining({ title: "Only one" }),
      null,
    ]);
    expect(layout.small).toEqual([null, null, null, null, null, null]);
  });

  it("uses only the first eight case studies when more are provided", () => {
    const caseStudies = Array.from({ length: 10 }, (_, index) =>
      makeCaseStudy({ slug: `project-${index}`, title: `Project ${index}` })
    );

    const layout = partitionBentoLayout(caseStudies);

    const filledTitles = [...layout.large, ...layout.small]
      .filter((slot): slot is CaseStudy => slot !== null)
      .map((slot) => slot.title);

    expect(filledTitles).toEqual([
      "Project 0",
      "Project 1",
      "Project 2",
      "Project 3",
      "Project 4",
      "Project 5",
      "Project 6",
      "Project 7",
    ]);
  });
});
