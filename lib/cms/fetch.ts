import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { canUseDemoContent } from "./fallbacks/resolve";

type FetchParams = Record<string, string | number | boolean | undefined>;

export type SanityFetchOptions = {
  /** Cache tags for on-demand revalidation (Phase E webhooks). */
  tags?: string[];
  /** Time-based revalidation in seconds. */
  revalidate?: number | false;
};

/**
 * Missing documents remain null; transport failures must not resurrect fixtures.
 */
export async function safeSanityFetch<T>(
  query: string,
  params: FetchParams = {},
  options: SanityFetchOptions = {},
): Promise<T | null> {
  if (process.env.CMS_DEMO_CONTENT === "true" && canUseDemoContent()) return null;
  if (!isSanityConfigured()) {
    if (canUseDemoContent()) return null;
    throw new Error("Website content is not configured.");
  }

  const { tags = ["sanity"], revalidate = 60 } = options;

  try {
    const result = await client.fetch<T | null>(query, params, {
      next: { tags, revalidate },
    });
    return result ?? null;
  } catch {
    console.error("[cms] Sanity fetch failed", {
      event: "cms_fetch_failed",
      tags,
    });
    throw new Error("Website content is temporarily unavailable.");
  }
}
