/**
 * Award seed builders from the static recognition slots.
 * Source: lib/cms/fallbacks/awards.ts (read-only). Never seed a real award —
 * canon forbids fabricating accolades, so every seeded slot is a placeholder.
 */

import { awardsFallback } from "@/lib/cms/fallbacks";
import type { Award } from "@/lib/cms/types";

import { awardId } from "../ids";
import type { SeedDocument } from "../types";

/** Build an award document from a placeholder slot. Stable ID: the slot `id`. */
export function buildAwardDocument(slot: Award, orderIndex: number): SeedDocument {
  return {
    _id: awardId(`slot-${orderIndex + 1}`),
    _type: "award",
    title: slot.title,
    ...(slot.label ? { label: slot.label } : {}),
    ...(slot.organization ? { organization: slot.organization } : {}),
    ...(slot.year ? { year: slot.year } : {}),
    order: orderIndex + 1,
    isPlaceholder: true,
  };
}

export function buildAwardDocuments(
  source: readonly Award[] = awardsFallback,
): SeedDocument[] {
  return source.map((slot, index) => buildAwardDocument(slot, index));
}
