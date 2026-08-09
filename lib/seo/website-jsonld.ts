import { DEFAULT_DESCRIPTION, SITE_NAME } from "./constants";
import { PRODUCTION_CANONICAL_ORIGIN } from "./site-url";

/** Site-wide WebSite schema — pairs with Organization via @id. */
export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${PRODUCTION_CANONICAL_ORIGIN}/#website`,
    name: SITE_NAME,
    url: PRODUCTION_CANONICAL_ORIGIN,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@id": `${PRODUCTION_CANONICAL_ORIGIN}/#organization`,
    },
    inLanguage: "en",
  };
}
