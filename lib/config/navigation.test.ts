import { describe, expect, it } from "vitest";

import { INTERIM_CONTACT_FORM_URL } from "@/lib/contact/channels";

import { CONTACT_CTA, PRIMARY_NAV_ITEMS } from "./navigation";

const EXPECTED_PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

describe("PRIMARY_NAV_ITEMS", () => {
  it("lists six primary nav links in locked order", () => {
    expect(PRIMARY_NAV_ITEMS).toHaveLength(6);
    expect([...PRIMARY_NAV_ITEMS]).toEqual([...EXPECTED_PRIMARY_NAV]);
  });

  it("excludes Products and Community from primary nav", () => {
    const labels = PRIMARY_NAV_ITEMS.map((item) => item.label);
    const hrefs = PRIMARY_NAV_ITEMS.map((item) => item.href);

    expect(labels).not.toContain("Products");
    expect(labels).not.toContain("Community");
    expect(hrefs).not.toContain("/products");
    expect(hrefs).not.toContain("/community");
  });

  it("keeps Contact as the in-app channels page", () => {
    expect(PRIMARY_NAV_ITEMS.find((item) => item.label === "Contact")?.href).toBe(
      "/contact",
    );
  });
});

describe("CONTACT_CTA", () => {
  it("points the interim primary CTA at the Google Form", () => {
    expect(CONTACT_CTA).toEqual({
      label: "Get in touch",
      href: INTERIM_CONTACT_FORM_URL,
    });
  });
});
