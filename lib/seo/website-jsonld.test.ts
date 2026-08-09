import { describe, expect, it } from "vitest";

import { getWebsiteJsonLd } from "./website-jsonld";

describe("getWebsiteJsonLd", () => {
  it("returns WebSite JSON-LD on the canonical production origin", () => {
    const jsonLd = getWebsiteJsonLd();

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://kamiyonstudio.com/#website",
      name: "Kamiyon Studio",
      url: "https://kamiyonstudio.com",
      description: expect.stringContaining("Kamiyon Studio"),
      publisher: {
        "@id": "https://kamiyonstudio.com/#organization",
      },
      inLanguage: "en",
    });
  });
});
