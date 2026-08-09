import { google } from "googleapis";

import {
  describeMissingAuth,
  readSearchConsoleEnv,
  type SearchConsoleEnv,
} from "./config";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/webmasters",
];

export function assertSearchConsoleAuthConfigured(
  env: SearchConsoleEnv = readSearchConsoleEnv(),
): void {
  const missing = describeMissingAuth(env);
  if (missing.length > 0) {
    throw new Error(
      [
        "Google Search Console API credentials are not configured.",
        ...missing,
      ].join("\n"),
    );
  }
}

export function createSearchConsoleAuth(
  env: SearchConsoleEnv = readSearchConsoleEnv(),
) {
  assertSearchConsoleAuthConfigured(env);

  if (env.clientEmail && env.privateKey) {
    return new google.auth.JWT({
      email: env.clientEmail,
      key: env.privateKey,
      scopes: SCOPES,
    });
  }

  const oauth2 = new google.auth.OAuth2(env.clientId, env.clientSecret);
  oauth2.setCredentials({ refresh_token: env.refreshToken });
  return oauth2;
}

export function createSearchConsoleClients(
  env: SearchConsoleEnv = readSearchConsoleEnv(),
) {
  const auth = createSearchConsoleAuth(env);
  return {
    auth,
    searchconsole: google.searchconsole({ version: "v1", auth }),
    webmasters: google.webmasters({ version: "v3", auth }),
  };
}
