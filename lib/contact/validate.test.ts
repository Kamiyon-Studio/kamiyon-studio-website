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
});
