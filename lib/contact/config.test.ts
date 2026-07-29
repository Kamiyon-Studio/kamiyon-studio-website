import { afterEach, describe, expect, it } from "vitest";

import { PUBLIC_EMAIL } from "./channels";

describe("contact email config", () => {
  const original = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  };

  afterEach(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("exposes the locked from-address default for send.kamiyonstudio.com", async () => {
    const { DEFAULT_CONTACT_FROM_EMAIL } = await import("./config");
    expect(DEFAULT_CONTACT_FROM_EMAIL).toBe(
      "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
    );
  });

  it("defaults CONTACT_TO_EMAIL to PUBLIC_EMAIL when unset", async () => {
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    const { getContactEmailConfig } = await import("./config");
    const config = getContactEmailConfig();
    expect(config.toEmail).toBe(PUBLIC_EMAIL);
    expect(config.fromEmail).toBe(
      "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
    );
    expect(config.isConfigured).toBe(false);
  });

  it("is configured only when RESEND_API_KEY is present", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_TO_EMAIL = "inbox@example.com";
    process.env.CONTACT_FROM_EMAIL =
      "Kamiyon Studio <noreply@send.kamiyonstudio.com>";
    const { getContactEmailConfig } = await import("./config");
    const config = getContactEmailConfig();
    expect(config.isConfigured).toBe(true);
    expect(config.apiKey).toBe("re_test");
    expect(config.toEmail).toBe("inbox@example.com");
  });
});
