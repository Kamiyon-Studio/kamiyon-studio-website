import {
  FACEBOOK_PAGE_URL,
  LINKEDIN_COMPANY_URL,
  PUBLIC_EMAIL,
} from "@/lib/contact/channels";

import { DEFAULT_DESCRIPTION, SITE_NAME } from "./constants";
import { PRODUCTION_CANONICAL_ORIGIN } from "./site-url";

/** Canon facts + operator-provided contact channels (2026-07-10). */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${PRODUCTION_CANONICAL_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: PRODUCTION_CANONICAL_ORIGIN,
    logo: `${PRODUCTION_CANONICAL_ORIGIN}/logo.svg`,
    description: DEFAULT_DESCRIPTION,
    foundingDate: "2024",
    email: PUBLIC_EMAIL,
    sameAs: [FACEBOOK_PAGE_URL, LINKEDIN_COMPANY_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Biñan City",
      addressRegion: "Laguna",
      addressCountry: "PH",
    },
  };
}
