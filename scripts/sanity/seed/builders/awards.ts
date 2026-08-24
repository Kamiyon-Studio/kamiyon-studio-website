/**
 * Award seed builders from the static recognition slots.
 * Source: lib/cms/fallbacks/awards.ts (read-only). Never seed a real award —
 * canon forbids fabricating accolades, so every seeded slot is a placeholder.
 *
 * RFC §1.2: include placeholderLabel on each slot.
 */

import { awardsFallback, type AwardFallbackSlot } from "@/lib/cms/fallbacks/awards";

import { awardId } from "../ids";
import type { SeedDocument } from "../types";

/** Build an award document from a placeholder slot. Stable ID: the slot `id`. */
export function buildAwardDocument(
  slot: AwardFallbackSlot,
  orderIndex: number,
): SeedDocument {
  return {
    _id: awardId(`slot-${orderIndex + 1}`),
    _type: "award",
    title: slot.title,
    ...(slot.label ? { label: slot.label } : {}),
    ...(slot.organization ? { organization: slot.organization } : {}),
    ...(slot.year ? { year: slot.year } : {}),
    order: orderIndex + 1,
    isPlaceholder: true,
    placeholderLabel: slot.placeholderLabel ?? "Placeholder",
  };
}

export function buildAwardDocuments(
  source: readonly AwardFallbackSlot[] = awardsFallback,
): SeedDocument[] {
  return source.map((slot, index) => buildAwardDocument(slot, index));
}
