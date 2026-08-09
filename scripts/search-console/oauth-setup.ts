#!/usr/bin/env tsx
/**
 * One-time helper to obtain a Search Console OAuth refresh token.
 *
 * Prerequisites:
 * 1. Create an OAuth client (Desktop app) in Google Cloud Console.
 * 2. Enable "Google Search Console API".
 * 3. Set GOOGLE_SEARCH_CONSOLE_CLIENT_ID and GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET.
 *
 * Usage:
 *   pnpm seo:oauth-setup
 *
 * Paste the authorization code when prompted. Copy the refresh token into
 * `.env.local` (never commit it).
 */

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/webmasters",
];

async function main() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.error(
      "Set GOOGLE_SEARCH_CONSOLE_CLIENT_ID and GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET before running this helper.",
    );
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "urn:ietf:wg:oauth:2.0:oob",
  );
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("Open this URL in a browser, approve access, then paste the code:\n");
  console.log(authUrl);
  console.log("");

  const rl = readline.createInterface({ input, output });
  const code = (await rl.question("Authorization code: ")).trim();
  rl.close();

  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    console.error(
      "No refresh_token returned. Revoke prior access for this client and retry with prompt=consent.",
    );
    process.exit(1);
  }

  console.log("\nAdd this to `.env.local` (do not commit):\n");
  console.log(`GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN=${tokens.refresh_token}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
