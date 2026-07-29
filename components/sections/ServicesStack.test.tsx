import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ServicesStack, type ServiceStackSlide } from "./ServicesStack";

/** Gate 0 five-service taxonomy fixtures (ADR-016). */
const slides: ServiceStackSlide[] = [
  {
    id: "game-development",
    eyebrow: "Services",
    title: "Game Development",
    summary: "Build immersive games that inspire, educate, and entertain.",
    exploreHref: "/services/game-development",
  },
  {
    id: "product-development",
    eyebrow: "Services",
    title: "Product Development",
    summary: "Transform ideas into modern digital products.",
    exploreHref: "/services/product-development",
  },
  {
    id: "ui-design",
    eyebrow: "Services",
    title: "UI & Design",
    summary: "Design experiences people love to use.",
    exploreHref: "/services/ui-design",
  },
  {
    id: "branding",
    eyebrow: "Services",
    title: "Branding",
    summary: "Build memorable brands with purpose.",
    exploreHref: "/services/branding",
  },
  {
    id: "community-events",
    eyebrow: "Services",
    title: "Community & Events",
    summary: "Grow communities through meaningful experiences.",
    exploreHref: "/services/community-events",
  },
];

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("ServicesStack", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when slides is empty", () => {
    const { container } = render(<ServicesStack slides={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders section heading and service title links", () => {
    render(<ServicesStack slides={slides} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What we build" }),
    ).toBeInTheDocument();

    slides.forEach((slide) => {
      const links = screen.getAllByRole("link", { name: slide.title });
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", slide.exploreHref);
    });
  });

  it("does not render legacy Explore buttons or ScrollStack cards", () => {
    const { container } = render(<ServicesStack slides={slides} />);

    expect(screen.queryByRole("link", { name: "Explore" })).not.toBeInTheDocument();
    expect(container.querySelector(".scroll-stack-scroller--window")).toBeNull();
    expect(container.querySelectorAll(".scroll-stack-card")).toHaveLength(0);
  });

  it("exposes View all services and Get in touch CTAs", () => {
    render(<ServicesStack slides={slides} />);

    expect(
      screen.getByRole("link", { name: "View all services" }),
    ).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
