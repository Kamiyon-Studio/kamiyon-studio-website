import { describe, expect, it } from "vitest";

import { getBreadcrumbJsonLd } from "./breadcrumb-jsonld";

describe("getBreadcrumbJsonLd", () => {
  it("builds a BreadcrumbList with absolute item URLs", () => {
    const jsonLd = getBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Sample Project", href: "/portfolio/sample-project" },
    ]);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://kamiyonstudio.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Portfolio",
        item: "https://kamiyonstudio.com/portfolio",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Sample Project",
        item: "https://kamiyonstudio.com/portfolio/sample-project",
      },
    ]);
  });

  it("preserves already-absolute item URLs", () => {
    const jsonLd = getBreadcrumbJsonLd([
      { name: "Home", href: "https://kamiyonstudio.com" },
    ]);

    expect(jsonLd.itemListElement[0]?.item).toBe("https://kamiyonstudio.com");
  });

  it("returns an empty itemListElement for an empty breadcrumb trail", () => {
    expect(getBreadcrumbJsonLd([]).itemListElement).toEqual([]);
  });
});
