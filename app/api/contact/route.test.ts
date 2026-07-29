import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

vi.mock("@/lib/contact/rate-limit", () => ({
  contactRateLimiter: {
    check: vi.fn(() => ({ allowed: true })),
  },
}));

describe("POST /api/contact", () => {
  const original = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  };

  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null });
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "kamiyonstudio@gmail.com";
    process.env.CONTACT_FROM_EMAIL =
      "Kamiyon Studio <noreply@send.kamiyonstudio.com>";
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  async function post(body: unknown, headers: HeadersInit = {}) {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return POST(request);
  }

  it("returns 503 when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const response = await post({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Contact form is not configured",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await post({
      name: "Ada",
      email: "not-email",
      message: "Hi",
    });

    expect(response.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 200 without sending when honeypot is filled", async () => {
    const response = await post({
      name: "Bot",
      email: "bot@example.com",
      message: "This is a long enough spam message.",
      company: "acme",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { sent: true },
      error: null,
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends emails and returns success for a valid payload", async () => {
    const response = await post({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { sent: true },
      error: null,
    });
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("returns 429 when rate limited", async () => {
    const { contactRateLimiter } = await import("@/lib/contact/rate-limit");
    vi.mocked(contactRateLimiter.check).mockReturnValueOnce({
      allowed: false,
      retryAfterSec: 42,
    });

    const response = await post({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(sendMock).not.toHaveBeenCalled();
  });
});
