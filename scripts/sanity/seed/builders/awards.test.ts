import { describe, expect, it } from "vitest";

import { awardsFallback } from "@/lib/cms/fallbacks";

import { awardId } from "../ids";
import { buildAllSeedDocuments, buildAwardDocument, buildAwardDocuments } from "./index";

describe("award seed builders", () => {
  it("emits stable hyphen IDs that match the static recognition slots", () => {
    const docs = buildAwardDocuments();

    expect(docs.map((d) => d._id)).toEqual([
      "award-slot-1",
      "award-slot-2",
      "award-slot-3",
    ]);
    expect(awardId("slot-1")).toBe("award-slot-1");
    // Fallback ids must equal seeded ids so React keys stay stable when the
    // CMS list replaces the fallback.
    expect(awardsFallback.map((a) => a.id)).toEqual(docs.map((d) => d._id));
  });

  it("seeds every slot as a placeholder with no fabricated accolade", () => {
    for (const [index, doc] of buildAwardDocuments().entries()) {
      expect(doc).toMatchObject({
        _type: "award",
        title: "Award slot",
        label: "Recognition",
        order: index + 1,
        isPlaceholder: true,
      });
      expect(doc).not.toHaveProperty("year");
    }
  });

  it("buildAwardDocument maps a single slot", () => {
    expect(buildAwardDocument(awardsFallback[0]!, 0)).toEqual({
      _id: "award-slot-1",
      _type: "award",
      title: "Award slot",
      label: "Recognition",
      organization: "Details coming soon",
      order: 1,
      isPlaceholder: true,
    });
  });

  it("seeds awards after partners and before blog in the full set", () => {
    const ids = buildAllSeedDocuments().map((d) => d._id);

    expect(ids.indexOf("partner-partner-1")).toBeLessThan(
      ids.indexOf("award-slot-1"),
    );
    expect(ids.indexOf("award-slot-1")).toBeLessThan(ids.indexOf("post-coming-soon"));
  });
});
