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
let ioCallback: IOCallback | null = null;

class MockIntersectionObserver {
  observe = observeMock;
  disconnect = disconnectMock;
  unobserve = vi.fn();

  constructor(callback: IOCallback, _options?: IntersectionObserverInit) {
    ioCallback = callback;
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
  act(() => {
    ioCallback?.(
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
    ioCallback = null;
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

  it("sets data-nav-theme on the root from IntersectionObserver sections", async () => {
    const { container } = render(
      <SterlingGateKineticNavigation navItems={navItems} siteName="Kamiyon Studio" />,
    );

    const root = container.querySelector(".sterling-gate");
    expect(root).toHaveAttribute("data-nav-theme", "light");
    expect(observeMock).toHaveBeenCalled();

    fireIntersection([
      { target: observedTarget("home-hero"), intersectionRatio: 0.85 },
      { target: observedTarget("home-partners"), intersectionRatio: 0.1 },
    ]);

    await waitFor(() => {
      expect(root).toHaveAttribute("data-nav-theme", "dark");
    });
  });

  it("forces light ink while the menu is open", async () => {
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

    expect(root).toHaveAttribute("data-nav-theme", "light");
  });

  it("applies dark ink token when data-nav-theme is dark", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(
      /\.sterling-gate\[data-nav-theme="dark"\]\s*\{\s*--sg-ink:\s*var\(--color-ivory\);\s*\}/,
    );
  });
});
