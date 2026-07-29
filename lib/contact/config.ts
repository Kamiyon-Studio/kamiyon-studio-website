import { PUBLIC_EMAIL } from "./channels";

/** Locked plan 2026-07-26 — sending subdomain keeps apex reputation clean. */
export const DEFAULT_CONTACT_FROM_EMAIL =
  "Kamiyon Studio <noreply@send.kamiyonstudio.com>";

export type ContactEmailConfig = {
  apiKey: string | null;
  toEmail: string;
  fromEmail: string;
  isConfigured: boolean;
};

/**
 * Resolve contact mail env. Missing `RESEND_API_KEY` → not configured (API returns 503).
 * `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` fall back to locked defaults.
 */
export function getContactEmailConfig(): ContactEmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || PUBLIC_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_CONTACT_FROM_EMAIL;

  return {
    apiKey,
    toEmail,
    fromEmail,
    isConfigured: Boolean(apiKey),
  };
}
