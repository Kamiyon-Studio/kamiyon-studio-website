import { describe, expect, it } from "vitest";

import {
  FACEBOOK_PAGE_URL,
  LINKEDIN_COMPANY_URL,
  PUBLIC_EMAIL,
} from "@/lib/contact/channels";
import { getOrganizationJsonLd } from "./organization-jsonld";

describe("getOrganizationJsonLd", () => {
  it("returns Organization JSON-LD with canonical url, logo, and contact channels", () => {
    const jsonLd = getOrganizationJsonLd();

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://kamiyonstudio.com/#organization",
      name: "Kamiyon Studio",
      url: "https://kamiyonstudio.com",
      logo: "https://kamiyonstudio.com/logo.svg",
      description: expect.stringContaining("Kamiyon Studio"),
      foundingDate: "2024",
      email: PUBLIC_EMAIL,
      sameAs: [FACEBOOK_PAGE_URL, LINKEDIN_COMPANY_URL],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Biñan City",
        addressRegion: "Laguna",
        addressCountry: "PH",
      },
    });
  });
});
