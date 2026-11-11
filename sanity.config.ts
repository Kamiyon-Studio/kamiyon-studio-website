/**
 * Sanity Studio config — deployed via `pnpm sanity:deploy` to *.sanity.studio.
 * The Next.js Worker only redirects `/studio` → hosted Studio (see ADR-007).
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "kamiyon-studio",
  title: "Kamiyon Studio",
  // Hosted Studio is served at the root of *.sanity.studio
  basePath: "/",
  // projectId/dataset come from sanity/env.ts (static process.env + repo defaults).
  // Do not use dynamic process.env[key] — Sanity Vite will not inline those.
  projectId,
  dataset,
  auth: { loginMethod: "token" },
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
