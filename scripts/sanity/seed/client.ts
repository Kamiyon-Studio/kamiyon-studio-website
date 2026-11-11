/**
 * Sanity write client for seed mutations (WS8d).
 * Uses project/dataset defaults from sanity/env.ts (c6ej1xoj / kamiyon).
 */

import { createClient, type SanityClient } from "@sanity/client";

import { apiVersion, dataset, projectId } from "@/sanity/env";

export const WRITE_TOKEN_ENV = "SANITY_API_WRITE_TOKEN";

export type SeedWriteClientOptions = {
  token?: string;
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
};

/** Resolve write token from env (trimmed). Empty / whitespace → undefined. */
export function resolveWriteToken(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const raw = env[WRITE_TOKEN_ENV];
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Create a mutation-capable Sanity client.
 * Requires a write token — never use for public browser bundles.
 */
export function createSeedWriteClient(
  options: SeedWriteClientOptions = {},
): SanityClient {
  if (process.env.CMS_CONTENT_MODE === "read-only") {
    throw new Error("Content writes are disabled for this read-only environment.");
  }
  const token = options.token ?? resolveWriteToken();
  if (!token) {
    throw new Error(
      `Missing ${WRITE_TOKEN_ENV}. Create a server-only write token in Sanity Manage and set it in the environment (see .env.example).`,
    );
  }

  return createClient({
    projectId: options.projectId ?? projectId,
    dataset: options.dataset ?? dataset,
    apiVersion: options.apiVersion ?? apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });
}
