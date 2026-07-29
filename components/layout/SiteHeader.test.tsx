import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./SiteHeader";
import { testShellProps } from "./test-shell-props";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/gsap", () => {
  const timeline = {
    set: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  };

  const context = {
    revert: vi.fn(),
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
        return context;
      }),
    },
  };
});

vi.mock("gsap/CustomEase", () => ({
  CustomEase: {
    create: vi.fn(),
  },
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
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

  it("renders the logo and a primary nav landmark", () => {
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Kamiyon Studio — Home" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });

  it("renders the menu toggle collapsed by default", () => {
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the kinetic menu when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Site sections" })).toBeInTheDocument();
  });

  it("closes the menu on Escape", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("renders all primary routes inside the open menu", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const nav = screen.getByRole("navigation", { name: "Site sections" });
    for (const label of [
      "Home",
      "About",
      "Services",
      "Portfolio",
      "Blog",
      "Contact",
    ]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("reveals the contact CTA when the menu is open", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        navItems={testShellProps.navItems}
        contactCta={testShellProps.contactCta}
        siteName={testShellProps.siteName}
        socialLinks={testShellProps.socialLinks}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(
      screen.getByRole("link", { name: testShellProps.contactCta.label }),
    ).toHaveAttribute("href", testShellProps.contactCta.href);
  });
});
