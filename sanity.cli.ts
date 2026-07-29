/**
 * Sanity CLI — `pnpm sanity:deploy` / `pnpm sanity schema extract`
 * https://www.sanity.io/docs/cli
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const studioHost =
  process.env.SANITY_STUDIO_HOSTNAME?.trim() || "kamiyon";
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost,
  deployment: {
    // Fresh app from 2026-07-23 redeploy (old c08yt7… returned Studio not found)
    appId: "ig6pezs5vd2h9wa9isi4io79",
  },
  // Studio Vite does not read tsconfig paths; schema imports use `@/lib/...`.
  vite: {
    resolve: {
      alias: {
        "@": rootDir,
      },
    },
  },
});
