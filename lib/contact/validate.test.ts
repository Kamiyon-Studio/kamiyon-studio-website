import { describe, expect, it } from "vitest";

import { validateContactPayload } from "./validate";

describe("validateContactPayload", () => {
  it("accepts a valid payload and trims fields", () => {
    const result = validateContactPayload({
      name: "  Ada Lovelace  ",
      email: " ada@example.com ",
      message: "  Hello from the Analytical Engine.  ",
      company: "",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello from the Analytical Engine.",
      },
    });
  });

  it("rejects missing or invalid fields", () => {
    expect(validateContactPayload({}).ok).toBe(false);
    expect(
      validateContactPayload({
        name: "Ada",
        email: "not-an-email",
        message: "Hi",
      }).ok,
    ).toBe(false);
    expect(
      validateContactPayload({
        name: "Ada",
        email: "ada@example.com",
        message: "short",
      }).ok,
    ).toBe(false);
  });

  it("treats honeypot company as spam without validation errors", () => {
    const result = validateContactPayload({
      name: "Bot",
      email: "bot@example.com",
      message: "This is a long enough spam message.",
      company: "http://spam.example",
    });

    expect(result).toEqual({ ok: true, spam: true });
  });

  it("rejects names with control characters / CRLF injection", () => {
    const result = validateContactPayload({
      name: "Ada\r\nBcc: attacker@evil.com",
      email: "ada@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/invalid characters/i);
    }
  });

  it("rejects emails with C0 control characters", () => {
    const result = validateContactPayload({
      name: "Ada Lovelace",
      email: "ada\u0000@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(result.ok).toBe(false);
  });

  it("accepts international names", () => {
    const result = validateContactPayload({
      name: "Adá 上田",
      email: "ada@example.com",
      message: "Hello from the Analytical Engine.",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Adá 上田",
        email: "ada@example.com",
        message: "Hello from the Analytical Engine.",
      },
    });
  });

  it("allows newlines in message body", () => {
    const result = validateContactPayload({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Line one.\nLine two.\nLine three.",
    });

    expect(result.ok).toBe(true);
    if (result.ok && !result.spam) {
      expect(result.data.message).toContain("\n");
    }
  });
});
