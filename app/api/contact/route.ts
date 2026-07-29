import { Resend } from "resend";
import { NextResponse } from "next/server";

import { getContactEmailConfig } from "@/lib/contact/config";
import { contactRateLimiter } from "@/lib/contact/rate-limit";
import { sendContactEmails } from "@/lib/contact/send";
import { validateContactPayload } from "@/lib/contact/validate";

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

type ContactSuccess = { sent: true };

function jsonEnvelope<T>(
  status: number,
  body: ApiEnvelope<T>,
  headers?: HeadersInit,
): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(body, { status, headers });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiEnvelope<ContactSuccess>>> {
  const config = getContactEmailConfig();
  if (!config.isConfigured || !config.apiKey) {
    return jsonEnvelope(503, {
      success: false,
      data: null,
      error: "Contact form is not configured",
    });
  }

  const rate = contactRateLimiter.check(clientIp(request));
  if (!rate.allowed) {
    return jsonEnvelope(
      429,
      {
        success: false,
        data: null,
        error: "Too many requests. Please try again later.",
      },
      { "Retry-After": String(rate.retryAfterSec) },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonEnvelope(400, {
      success: false,
      data: null,
      error: "Invalid JSON body",
    });
  }

  if (!payload || typeof payload !== "object") {
    return jsonEnvelope(400, {
      success: false,
      data: null,
      error: "Invalid request body",
    });
  }

  const validated = validateContactPayload(
    payload as Record<string, unknown>,
  );

  if (!validated.ok) {
    return jsonEnvelope(400, {
      success: false,
      data: null,
      error: validated.error,
    });
  }

  if (validated.spam) {
    // Silent success — do not tip off bots.
    return jsonEnvelope(200, {
      success: true,
      data: { sent: true },
      error: null,
    });
  }

  const result = await sendContactEmails(
    {
      apiKey: config.apiKey,
      fromEmail: config.fromEmail,
      toEmail: config.toEmail,
      fields: validated.data,
    },
    (apiKey) => new Resend(apiKey),
  );

  if (!result.ok) {
    return jsonEnvelope(502, {
      success: false,
      data: null,
      error: result.error,
    });
  }

  return jsonEnvelope(200, {
    success: true,
    data: { sent: true },
    error: null,
  });
}
