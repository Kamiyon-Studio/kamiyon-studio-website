import { describe, expect, it } from "vitest";

import { buildHomePartnerReferences } from "./partners-only";

describe("partners-only seed", () => {
  it("builds seven stable partner refs for homePage", () => {
    const refs = buildHomePartnerReferences();
    expect(refs).toHaveLength(7);
    expect(refs.map((ref) => ref._ref)).toEqual([
      "partner-partner-1",
      "partner-partner-2",
      "partner-partner-3",
      "partner-partner-4",
      "partner-partner-5",
      "partner-partner-6",
      "partner-partner-7",
    ]);
    expect(refs.every((ref) => ref._type === "reference")).toBe(true);
  });
});
