/**
 * RFC — Sanity ↔ Frontend Align §1.2 awardsFallback + placeholderLabel
 */
import { describe, expect, it } from "vitest";

import { awardsFallback } from "./awards";

describe("awardsFallback (RFC placeholderLabel)", () => {
  it("keeps three starting slots (not a hard cap) with placeholderLabel", () => {
    expect(awardsFallback).toHaveLength(3);
    for (const slot of awardsFallback) {
      expect(slot.placeholderLabel).toBe("Placeholder");
      expect(slot.isPlaceholder).toBe(true);
    }
  });
});
