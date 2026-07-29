import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SterlingGateKineticNavigation } from "./sterling-gate-kinetic-navigation";

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "sterling-gate-kinetic-navigation.css",
);

type IOCallback = IntersectionObserverCallback;

const observeMock = vi.fn();
const disconnectMock = vi.fn();
let navThemeCallback: IOCallback | null = null;

/**
 * Local ratio-driven mock — the global vitest.setup.ts IO stub always reports
 * intersectionRatio: 1 for every target, which would make "dark wins" vacuous
 * when both dark and light bands are present (document order + equal ratios).
 *
 * Callback capture is deferred to observe(): next/image may construct its own
 * IntersectionObserver after useNavTheme, and last-constructor-wins would point
 * fireIntersection at the wrong listener.
 */
class MockIntersectionObserver {
  disconnect = disconnectMock;
  unobserve = vi.fn();
  private readonly callback: IOCallback;

  constructor(callback: IOCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    observeMock(target);
    if (
      target instanceof HTMLElement &&
      target.hasAttribute("data-nav-theme") &&
      !target.classList.contains("sterling-gate")
    ) {
      navThemeCallback = this.callback;
    }
  }
}

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

function fireIntersection(
  entries: Array<{ target: Element; intersectionRatio: number }>,
) {
  if (!navThemeCallback) {
    throw new Error("Expected useNavTheme IntersectionObserver callback");
  }

  act(() => {
    navThemeCallback?.(
      entries.map(({ target, intersectionRatio }) => ({
        target,
        intersectionRatio,
        isIntersecting: intersectionRatio > 0,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: 0,
      })),
      {} as IntersectionObserver,
    );
  });
}

function observedTarget(id: string): Element {
  const match = observeMock.mock.calls.find(([target]) => (target as Element).id === id);
  if (!match) {
    throw new Error(`Expected IntersectionObserver to observe #${id}`);
  }
  return match[0] as Element;
}

describe("SterlingGateKineticNavigation", () => {
  beforeEach(() => {
    navThemeCallback = null;
    observeMock.mockClear();
    disconnectMock.mockClear();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    document.body.innerHTML = `
      <section id="home-hero" data-nav-theme="dark"></section>
      <section id="home-partners" data-nav-theme="light"></section>
    `;

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
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    document.body.innerHTML = "";
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

  it("resets Services dropdown when closed via Escape", async () => {
    const user = userEvent.setup();
    const itemsWithDropdown = [
      {
        label: "Services",
        href: "/services",
        children: [
          { label: "Game Development", href: "/services/game-development" },
        ],
      },
      { label: "Portfolio", href: "/portfolio" },
    ];

    render(
      <SterlingGateKineticNavigation
        navItems={itemsWithDropdown}
        siteName="Kamiyon Studio"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Expand Services" }));
    expect(screen.getByRole("button", { name: "Collapse Services" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Expand Services" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("link", { name: "Game Development" })).not.toBeInTheDocument();
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

  it("renders a three-line hamburger icon without Menu/Close text labels", () => {
    const { container } = render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    const lines = container.querySelectorAll(".nav-hamburger-line");
    expect(lines).toHaveLength(3);
    expect(screen.queryByText("Menu")).not.toBeInTheDocument();
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("adds open class to morph the hamburger into an X", async () => {
    const user = userEvent.setup();
    render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).not.toHaveClass("open");

    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveClass("open");
  });

  it("uses transparent chrome without frosted surfaces on logo row and menu button", () => {
    const css = readFileSync(cssPath, "utf8");
    const logoRule = css.match(
      /\.sterling-gate\s+\.nav-logo-row\s*\{([\s\S]*?)\}/,
    );
    const buttonRule = css.match(
      /\.sterling-gate\s+\.nav-close-btn\s*\{([\s\S]*?)\}/,
    );

    expect(logoRule).not.toBeNull();
    expect(buttonRule).not.toBeNull();

    const logoBody = logoRule?.[1] ?? "";
    const buttonBody = buttonRule?.[1] ?? "";

    expect(logoBody).toMatch(/pointer-events:\s*auto/);
    expect(logoBody).not.toMatch(/backdrop-filter:/);
    expect(logoBody).not.toMatch(/background:\s*color-mix\(/);

    expect(buttonBody).toMatch(/background:\s*transparent/);
    expect(buttonBody).not.toMatch(/backdrop-filter:/);
  });

  it("flips data-nav-theme from dark to light by competing intersection ratios", async () => {
    const { container } = render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    const root = container.querySelector(".sterling-gate");
    expect(root).toHaveAttribute("data-nav-theme", "dark");
    expect(observeMock).toHaveBeenCalled();
    expect(navThemeCallback).toBeTypeOf("function");

    fireIntersection([
      { target: observedTarget("home-hero"), intersectionRatio: 0.85 },
      { target: observedTarget("home-partners"), intersectionRatio: 0.1 },
    ]);

    await waitFor(() => {
      expect(root).toHaveAttribute("data-nav-theme", "dark");
    });

    fireIntersection([
      { target: observedTarget("home-hero"), intersectionRatio: 0.05 },
      { target: observedTarget("home-partners"), intersectionRatio: 0.9 },
    ]);

    await waitFor(() => {
      expect(root).toHaveAttribute("data-nav-theme", "light");
    });
  });

  it("keeps light ink (ivory) while the menu is open", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    const root = container.querySelector(".sterling-gate");

    fireIntersection([{ target: observedTarget("home-hero"), intersectionRatio: 0.9 }]);

    await waitFor(() => {
      expect(root).toHaveAttribute("data-nav-theme", "dark");
    });

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(root).toHaveAttribute("data-nav-theme", "dark");
  });

  it("renders a collapsible Services dropdown and standalone links without toggles", async () => {
    const user = userEvent.setup();
    const itemsWithDropdown = [
      { label: "About", href: "/about" },
      {
        label: "Services",
        href: "/services",
        children: [
          { label: "Game Development", href: "/services/game-development" },
          { label: "Branding", href: "/services/branding" },
        ],
      },
      { label: "Portfolio", href: "/portfolio" },
    ];

    render(
      <SterlingGateKineticNavigation
        navItems={itemsWithDropdown}
        siteName="Kamiyon Studio"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
    expect(
      screen.queryByRole("button", { name: "Expand Portfolio" }),
    ).not.toBeInTheDocument();

    const expandServices = screen.getByRole("button", { name: "Expand Services" });
    expect(expandServices).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Game Development" })).not.toBeInTheDocument();

    await user.click(expandServices);

    expect(screen.getByRole("button", { name: "Collapse Services" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Game Development" })).toHaveAttribute(
      "href",
      "/services/game-development",
    );
    expect(screen.getByRole("link", { name: "Branding" })).toHaveAttribute(
      "href",
      "/services/branding",
    );
  });

  it("applies dark ink by default and light ink when data-nav-theme is light", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(
      /\.sterling-gate\s*\{[^}]*--sg-ink:\s*var\(--color-ivory\);/s,
    );
    expect(css).toMatch(
      /\.sterling-gate\[data-nav-theme="light"\]\s*\{\s*--sg-ink:\s*var\(--color-charcoal\);\s*\}/,
    );
    expect(css).toMatch(
      /\.sterling-gate\[data-nav-theme="dark"\]\s*\{\s*--sg-ink:\s*var\(--color-ivory\);\s*\}/,
    );
  });
});
