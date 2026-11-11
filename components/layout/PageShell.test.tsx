import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageShell } from "./PageShell";

vi.mock("@/lib/cms/site-settings-content", () => ({
  getSiteSettingsContent: vi.fn(async () => ({
    _type: "siteSettings",
    siteName: "Kamiyon Studio",
    tagline: "Tagline",
    socialLinks: [],
    defaultSeo: {
      title: "Kamiyon Studio",
      description: "Description",
    },
    globalCtas: [{ label: "Get in touch", href: "/contact", variant: "secondary" }],
    footerText: "Create. Play. Inspire.",
  })),
}));

describe("PageShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a skip-to-content link targeting the main landmark", async () => {
    render(await PageShell({ children: <p>Page content</p> }));

    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
    const main = document.getElementById("main-content");
    expect(main).not.toBeNull();
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main?.tagName).toBe("MAIN");
  });

  it("renders children inside the main landmark", async () => {
    render(await PageShell({ children: <p>Page content</p> }));

    const main = document.getElementById("main-content");
    expect(main).toContainElement(screen.getByText("Page content"));
  });

  it("stacks main above the curtain footer reveal", async () => {
    render(await PageShell({ children: <p>Page content</p> }));

    const main = document.getElementById("main-content");
    expect(main).toHaveClass("relative", "z-10");
    expect(main?.className).toContain("bg-[var(--bg-primary)]");
  });



  it("renders the site header and footer around the content", async () => {
    render(await PageShell({ children: <p>Page content</p> }));

    expect(screen.getAllByRole("banner").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("contentinfo").length).toBeGreaterThanOrEqual(1);
  });
});
