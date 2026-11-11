import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { tagsForSanityPayload } from "@/lib/cms/revalidate-tags";

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

type RevalidateData = {
  revalidated: string[];
  now: number;
};

function jsonEnvelope<T>(
  status: number,
  body: ApiEnvelope<T>,
): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(body, { status });
}

function secretsMatch(provided: string, expected: string): boolean {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

/**
 * Resolve webhook secret from Authorization Bearer or `?secret=` query.
 * Bearer matches other Phase E APIs; query param suits Sanity webhook URLs.
 */
function extractSecret(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (token) {
      return token;
    }
  }

  const headerSecret = request.headers.get("x-sanity-revalidate-secret")?.trim();
  if (headerSecret) {
    return headerSecret;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret")?.trim();
  return querySecret || null;
}

export async function POST(request: Request): Promise<NextResponse<ApiEnvelope<RevalidateData>>> {
  const expected = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!expected) {
    return jsonEnvelope<RevalidateData>(503, {
      success: false,
      data: null,
      error: "Revalidation is not configured",
    });
  }

  const provided = extractSecret(request);
  if (!provided || !secretsMatch(provided, expected)) {
    return jsonEnvelope<RevalidateData>(401, {
      success: false,
      data: null,
      error: "Unauthorized",
    });
  }

  let payload: unknown = {};
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = await request.json();
    } catch {
      return jsonEnvelope<RevalidateData>(400, {
        success: false,
        data: null,
        error: "Invalid JSON body",
      });
    }
  }

  const tags =
    payload && typeof payload === "object"
      ? tagsForSanityPayload(payload as { _type?: unknown; slug?: unknown })
      : tagsForSanityPayload({});

  // Webhooks need immediate expiry so the next request refetches Sanity.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  console.info("[cms] Revalidation requested", {
    event: "cms_revalidation_requested",
    tags,
  });

  return jsonEnvelope(200, {
    success: true,
    data: {
      revalidated: tags,
      now: Date.now(),
    },
    error: null,
  });
}
