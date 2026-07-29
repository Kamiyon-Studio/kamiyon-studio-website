import { hasControlCharacters } from "./sanitize";

export type ContactFormFields = {
  name: string;
  email: string;
  message: string;
};

export type ContactPayloadInput = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot — must stay empty for humans. */
  company?: unknown;
};

export type ValidateContactResult =
  | { ok: true; data: ContactFormFields; spam?: undefined }
  | { ok: true; spam: true }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE = 10;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value.trim();
}

export function validateContactPayload(
  input: ContactPayloadInput,
): ValidateContactResult {
  const company = asTrimmedString(input.company);
  if (company) {
    return { ok: true, spam: true };
  }

  const name = asTrimmedString(input.name);
  const email = asTrimmedString(input.email);
  const message = asTrimmedString(input.message);

  if (!name || name.length > MAX_NAME) {
    return { ok: false, error: "Please provide your name." };
  }

  if (hasControlCharacters(name)) {
    return {
      ok: false,
      error: "Name contains invalid characters. Please remove line breaks and special control characters.",
    };
  }

  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please provide a valid email address." };
  }

  if (hasControlCharacters(email)) {
    return {
      ok: false,
      error: "Email contains invalid characters. Please use a standard email address.",
    };
  }

  if (!message || message.length < MIN_MESSAGE) {
    return {
      ok: false,
      error: `Please write a message of at least ${MIN_MESSAGE} characters.`,
    };
  }

  if (message.length > MAX_MESSAGE) {
    return { ok: false, error: "Message is too long." };
  }

  return {
    ok: true,
    data: { name, email, message },
  };
}
