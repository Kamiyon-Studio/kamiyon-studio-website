import { PRODUCTION_CANONICAL_HOST } from "../../../lib/seo/site-url";

/** Domain property preferred; URL-prefix property also accepted. */
export function getSearchConsoleSiteUrl(): string {
  const configured = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (configured) {
    return configured;
  }
  // Domain properties use the `sc-domain:` prefix in the Search Console API.
  return `sc-domain:${PRODUCTION_CANONICAL_HOST}`;
}

export function getSitemapUrl(): string {
  return (
    process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL?.trim() ||
    "https://kamiyonstudio.com/sitemap.xml"
  );
}

export type SearchConsoleEnv = {
  clientEmail?: string;
  privateKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
};

export function readSearchConsoleEnv(): SearchConsoleEnv {
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  return {
    clientEmail: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim(),
    privateKey: privateKey?.trim(),
    clientId: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID?.trim(),
    clientSecret: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET?.trim(),
    refreshToken: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN?.trim(),
  };
}

export function describeMissingAuth(env: SearchConsoleEnv): string[] {
  const missing: string[] = [];
  const hasServiceAccount = Boolean(env.clientEmail && env.privateKey);
  const hasOAuth = Boolean(env.clientId && env.clientSecret && env.refreshToken);

  if (hasServiceAccount || hasOAuth) {
    return missing;
  }

  missing.push(
    "Configure either service-account vars (GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL + GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY)",
  );
  missing.push(
    "or OAuth vars (GOOGLE_SEARCH_CONSOLE_CLIENT_ID + GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET + GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN).",
  );
  missing.push("See docs/SEO.md for the manual Google authorization steps.");
  return missing;
}
