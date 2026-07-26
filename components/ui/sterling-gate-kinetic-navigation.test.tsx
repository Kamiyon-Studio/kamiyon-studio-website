import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SterlingGateKineticNavigation } from "./sterling-gate-kinetic-navigation";

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "sterling-gate-kinetic-navigation.css",
);

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/gsap", () => {
  const timeline = {
    set: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
  };

  return {
    gsap: {
      set: vi.fn(),
      to: vi.fn(),
      fromTo: vi.fn(),
      defaults: vi.fn(),
      parseEase: vi.fn(() => null),
      registerPlugin: vi.fn(),
      timeline: vi.fn(() => timeline),
      context: vi.fn((fn: () => void) => {
        fn();
        return { revert: vi.fn() };
      }),
    },
  };
});

vi.mock("gsap/CustomEase", () => ({
  CustomEase: { create: vi.fn() },
}));

const navItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

describe("SterlingGateKineticNavigation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nav labels and hrefs from props when opened", async () => {
    const user = userEvent.setup();
    render(
      <SterlingGateKineticNavigation
        navItems={navItems}
        siteName="Kamiyon Studio"
        contactCta={{ label: "Get in touch", href: "/contact" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("does not throw under prefers-reduced-motion", async () => {
    const user = userEvent.setup();
    expect(() =>
      render(
        <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
      ),
    ).not.toThrow();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("keeps the home logo link available while the menu is open", async () => {
    const user = userEvent.setup();
    render(
      <SterlingGateKineticNavigation
        navItems={navItems}
        siteName="Kamiyon Studio"
        contactCta={{ label: "Get in touch", href: "/contact" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const home = screen.getByRole("link", { name: "Kamiyon Studio — Home" });
    expect(home).toBeVisible();
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveClass("nav-logo-row");
  });

  it("styles the logo row with a frosted surface so the wordmark stays readable on dark heroes", () => {
    const css = readFileSync(cssPath, "utf8");
    const logoRule = css.match(
      /\.sterling-gate\s+\.nav-logo-row\s*\{([\s\S]*?)\}/,
    );

    expect(logoRule).not.toBeNull();
    const body = logoRule?.[1] ?? "";
    expect(body).toMatch(/pointer-events:\s*auto/);
    expect(body).toMatch(/backdrop-filter:\s*blur\(/);
    expect(body).toMatch(/background:\s*color-mix\(/);
  });
});
