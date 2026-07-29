import { describe, expect, it, vi } from "vitest";

import {
  buildStudioNotificationText,
  buildVisitorConfirmationText,
  sendContactEmails,
  type ResendLike,
} from "./send";
import { PUBLIC_EMAIL } from "./channels";

const fields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello from the Analytical Engine.",
};

describe("contact send helpers", () => {
  it("builds studio and visitor plain-text bodies", () => {
    expect(buildStudioNotificationText(fields)).toContain("Ada Lovelace");
    expect(buildStudioNotificationText(fields)).toContain("ada@example.com");
    expect(buildVisitorConfirmationText(fields)).toContain("Hi Ada Lovelace");
    expect(buildVisitorConfirmationText(fields)).toContain(PUBLIC_EMAIL);
  });

  it("sends studio notification then visitor confirmation", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "1" }, error: null });
    const client: ResendLike = { emails: { send } };

    const result = await sendContactEmails(
      {
        apiKey: "re_test",
        fromEmail: "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
        toEmail: PUBLIC_EMAIL,
        fields,
      },
      () => client,
    );

    expect(result).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0]).toMatchObject({
      to: [PUBLIC_EMAIL],
      replyTo: "ada@example.com",
      subject: "Contact: Ada Lovelace",
    });
    expect(send.mock.calls[1][0]).toMatchObject({
      to: ["ada@example.com"],
      replyTo: PUBLIC_EMAIL,
    });
  });

  it("returns failure when Resend reports an error", async () => {
    const send = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await sendContactEmails(
      {
        apiKey: "re_test",
        fromEmail: "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
        toEmail: PUBLIC_EMAIL,
        fields,
      },
      () => ({ emails: { send } }),
    );

    expect(result).toEqual({ ok: false, error: "Failed to deliver message." });
  });

  it("sanitizes CRLF in name so subject cannot inject headers", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "1" }, error: null });
    const client: ResendLike = { emails: { send } };

    await sendContactEmails(
      {
        apiKey: "re_test",
        fromEmail: "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
        toEmail: PUBLIC_EMAIL,
        fields: {
          name: "Ada\r\nBcc: attacker@evil.com",
          email: "ada@example.com",
          message: "Hello from the Analytical Engine.",
        },
      },
      () => client,
    );

    const studioArgs = send.mock.calls[0]![0] as {
      subject: string;
      replyTo?: string;
    };
    // Control chars stripped — "Bcc:" may remain as literal subject text,
    // but cannot form a separate header line without \r/\n.
    expect(studioArgs.subject).not.toMatch(/[\r\n]/);
    expect(studioArgs.subject).toBe("Contact: Ada Bcc: attacker@evil.com");
    expect(studioArgs.replyTo).toBe("ada@example.com");
    expect(studioArgs.replyTo).not.toMatch(/[\r\n]/);
  });

  it("sanitizes control characters in replyTo email", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "1" }, error: null });

    await sendContactEmails(
      {
        apiKey: "re_test",
        fromEmail: "Kamiyon Studio <noreply@send.kamiyonstudio.com>",
        toEmail: PUBLIC_EMAIL,
        fields: {
          name: "Ada Lovelace",
          email: "ada\r\n@example.com",
          message: "Hello from the Analytical Engine.",
        },
      },
      () => ({ emails: { send } }),
    );

    const studioArgs = send.mock.calls[0]![0] as { replyTo?: string };
    expect(studioArgs.replyTo).toBeDefined();
    expect(studioArgs.replyTo).not.toMatch(/[\r\n]/);
  });
});
