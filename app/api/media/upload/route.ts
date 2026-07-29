import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { resolveMediaBucket } from "@/lib/cms/media-bucket";
import {
  buildMediaPublicUrl,
  createMediaObjectKey,
  readImageDimensions,
  type MediaUploadResult,
} from "@/lib/cms/media";
import {
  isAllowedUploadMimeType,
  isWithinUploadSizeLimit,
  normalizeMimeType,
  parseContentLength,
} from "@/lib/cms/media-upload-policy";
import { getHostedStudioUrl } from "@/sanity/studio-url";

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

const CORS_ALLOW_HEADERS = "Authorization, Content-Type";
const CORS_ALLOW_METHODS = "POST, OPTIONS";

function allowedStudioOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) {
    return null;
  }

  let studioOrigin: string;
  try {
    studioOrigin = new URL(getHostedStudioUrl()).origin;
  } catch {
    return null;
  }

  if (requestOrigin === studioOrigin) {
    return requestOrigin;
  }

  // Local Sanity Vite (`sanity dev`) defaults to http://localhost:3333
  if (
    process.env.APP_ENV === "local" ||
    process.env.NODE_ENV === "development"
  ) {
    try {
      const { hostname, protocol } = new URL(requestOrigin);
      if (
        (hostname === "localhost" || hostname === "127.0.0.1") &&
        (protocol === "http:" || protocol === "https:")
      ) {
        return requestOrigin;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function withCors<T>(
  request: Request,
  response: NextResponse<T>,
): NextResponse<T> {
  const allowOrigin = allowedStudioOrigin(request.headers.get("origin"));
  if (allowOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
    response.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

function jsonEnvelope<T>(
  request: Request,
  status: number,
  body: ApiEnvelope<T>,
): NextResponse<ApiEnvelope<T>> {
  return withCors(request, NextResponse.json(body, { status }));
}

function secretsMatch(provided: string, expected: string): boolean {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function extractBearerSecret(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.slice("Bearer ".length).trim();
  return token || null;
}

async function extractUploadFile(request: Request): Promise<File | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return null;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return null;
  }

  const entry = form.get("file");
  return entry instanceof File && entry.size > 0 ? entry : null;
}

/** CORS preflight for hosted Sanity Studio → Worker upload. */
export async function OPTIONS(request: Request): Promise<NextResponse> {
  const allowOrigin = allowedStudioOrigin(request.headers.get("origin"));
  if (!allowOrigin) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
      "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiEnvelope<MediaUploadResult>>> {
  const expected = process.env.MEDIA_UPLOAD_SECRET?.trim();
  if (!expected) {
    return jsonEnvelope<MediaUploadResult>(request, 503, {
      success: false,
      data: null,
      error: "Media upload is not configured",
    });
  }

  const provided = extractBearerSecret(request);
  if (!provided || !secretsMatch(provided, expected)) {
    return jsonEnvelope<MediaUploadResult>(request, 401, {
      success: false,
      data: null,
      error: "Unauthorized",
    });
  }

  const contentLength = parseContentLength(
    request.headers.get("content-length"),
  );
  if (contentLength != null && !isWithinUploadSizeLimit(contentLength)) {
    return jsonEnvelope<MediaUploadResult>(request, 413, {
      success: false,
      data: null,
      error: "File too large",
    });
  }

  const file = await extractUploadFile(request);
  if (!file) {
    return jsonEnvelope<MediaUploadResult>(request, 400, {
      success: false,
      data: null,
      error: "Missing file",
    });
  }

  if (!isWithinUploadSizeLimit(file.size)) {
    return jsonEnvelope<MediaUploadResult>(request, 413, {
      success: false,
      data: null,
      error: "File too large",
    });
  }

  const mimeType = normalizeMimeType(file.type?.trim() || "");
  if (!isAllowedUploadMimeType(mimeType)) {
    return jsonEnvelope<MediaUploadResult>(request, 415, {
      success: false,
      data: null,
      error: "Unsupported media type",
    });
  }

  const key = createMediaObjectKey(file.name || "upload.bin");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = readImageDimensions(bytes, mimeType);
  const url = buildMediaPublicUrl(key);

  if (!url) {
    return jsonEnvelope<MediaUploadResult>(request, 503, {
      success: false,
      data: null,
      error: "NEXT_PUBLIC_R2_PUBLIC_BASE_URL is not configured",
    });
  }

  try {
    const bucket = await resolveMediaBucket();
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: mimeType },
    });
  } catch {
    return jsonEnvelope<MediaUploadResult>(request, 503, {
      success: false,
      data: null,
      error: "MEDIA_BUCKET binding is unavailable",
    });
  }

  const data: MediaUploadResult = {
    key,
    url,
    mimeType,
    ...(dimensions?.width != null ? { width: dimensions.width } : {}),
    ...(dimensions?.height != null ? { height: dimensions.height } : {}),
  };

  return jsonEnvelope<MediaUploadResult>(request, 200, {
    success: true,
    data,
    error: null,
  });
}
