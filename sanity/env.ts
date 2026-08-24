/**
 * Shared Sanity env for Next.js (NEXT_PUBLIC_*) and hosted Studio (SANITY_STUDIO_*).
 *
 * Hosted `sanity deploy` only inlines *static* `process.env.SANITY_STUDIO_*` access.
 * Dynamic keys like `process.env[name]` are NOT replaced and stay empty in the browser.
 *
 * @see https://www.sanity.io/docs/studio/environment-variables
 */

/** Public project id — safe to ship in Studio/client bundles. */
const DEFAULT_PROJECT_ID = "c6ej1xoj";

/** Default dataset for this site (staging + Studio). */
const DEFAULT_DATASET = "kamiyon";

// Keep each process.env.* as a static identifier so Vite/Sanity can inline it.
const studioProjectId = process.env.SANITY_STUDIO_PROJECT_ID;
const nextProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const studioDataset = process.env.SANITY_STUDIO_DATASET;
const nextDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const studioApiVersion = process.env.SANITY_STUDIO_API_VERSION;
const nextApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

export const apiVersion =
  studioApiVersion?.trim() || nextApiVersion?.trim() || "2026-07-21";

export const dataset =
  studioDataset?.trim() ||
  nextDataset?.trim() ||
  DEFAULT_DATASET;

export const projectId =
  studioProjectId?.trim() ||
  nextProjectId?.trim() ||
  DEFAULT_PROJECT_ID;

export function isSanityConfigured(): boolean {
  // True when an explicit env is set OR when this repo's known defaults apply.
  const hasExplicit =
    Boolean(studioProjectId?.trim() || nextProjectId?.trim()) &&
    Boolean(studioDataset?.trim() || nextDataset?.trim());
  return hasExplicit || Boolean(DEFAULT_PROJECT_ID && DEFAULT_DATASET);
}
