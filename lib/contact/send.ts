import { PUBLIC_EMAIL } from "./channels";
import { sanitizeHeaderValue } from "./sanitize";
import type { ContactFormFields } from "./validate";

export type SendContactEmailsInput = {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  fields: ContactFormFields;
};

export type SendContactEmailsResult =
  | { ok: true }
  | { ok: false; error: string };

type ResendSendArgs = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
};

export type ResendLike = {
  emails: {
    send: (
      args: ResendSendArgs,
    ) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
  };
};

function escapePlain(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

export function buildStudioNotificationText(fields: ContactFormFields): string {
  return [
    "New contact form submission from kamiyonstudio.com",
    "",
    `Name: ${escapePlain(fields.name)}`,
    `Email: ${escapePlain(fields.email)}`,
    "",
    "Message:",
    escapePlain(fields.message),
  ].join("\n");
}

export function buildVisitorConfirmationText(fields: ContactFormFields): string {
  return [
    `Hi ${escapePlain(fields.name)},`,
    "",
    "Thanks for reaching out to Kamiyon Studio. We received your message and will get back to you soon.",
    "",
    "— Kamiyon Studio",
    PUBLIC_EMAIL,
  ].join("\n");
}

/**
 * Send studio inbox notification + visitor confirmation via Resend.
 * Inject `createClient` in tests; production uses the Resend SDK.
 */
export async function sendContactEmails(
  input: SendContactEmailsInput,
  createClient: (apiKey: string) => ResendLike,
): Promise<SendContactEmailsResult> {
  const client = createClient(input.apiKey);

  const subject = sanitizeHeaderValue(`Contact: ${input.fields.name}`);
  const replyTo = sanitizeHeaderValue(input.fields.email);

  const studio = await client.emails.send({
    from: input.fromEmail,
    to: [input.toEmail],
    subject,
    text: buildStudioNotificationText(input.fields),
    replyTo,
  });

  if (studio.error) {
    return { ok: false, error: "Failed to deliver message." };
  }

  const visitor = await client.emails.send({
    from: input.fromEmail,
    to: [input.fields.email],
    subject: "We received your message — Kamiyon Studio",
    text: buildVisitorConfirmationText(input.fields),
    replyTo: PUBLIC_EMAIL,
  });

  if (visitor.error) {
    return { ok: false, error: "Failed to deliver message." };
  }

  return { ok: true };
}
