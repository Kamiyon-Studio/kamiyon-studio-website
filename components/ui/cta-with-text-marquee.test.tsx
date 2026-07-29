import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CTAWithVerticalMarquee, {
  type VerticalMarqueeItem,
} from "./cta-with-text-marquee";

const items: VerticalMarqueeItem[] = [
  {
    id: "game-development",
    label: "Game Development",
    href: "/services/game-development",
  },
  {
    id: "product-development",
    label: "Product Development",
    href: "/services/product-development",
  },
  {
    id: "ui-design",
    label: "UI & Design",
    href: "/services/ui-design",
  },
];

const baseProps = {
  eyebrow: "Services",
  heading: "What we build",
  body: "Five focused offerings—from games and products to design, branding, and community.",
  primaryCta: { label: "View all services", href: "/services" },
  secondaryCta: { label: "Get in touch", href: "/contact" },
  items,
};

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

describe("CTAWithVerticalMarquee", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when items is empty", () => {
    const { container } = render(
      <CTAWithVerticalMarquee {...baseProps} items={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders heading, body, and CTA links", () => {
    render(<CTAWithVerticalMarquee {...baseProps} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What we build" }),
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.body)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all services" }),
    ).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("renders each service row as a link to its service page", () => {
    render(<CTAWithVerticalMarquee {...baseProps} />);

    items.forEach((item) => {
      const links = screen.getAllByRole("link", { name: item.label });
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", item.href);
    });
  });

  it("keeps duplicate marquee track non-interactive", () => {
    const { container } = render(<CTAWithVerticalMarquee {...baseProps} />);

    const hiddenTrack = container.querySelector('[aria-hidden="true"]');
    expect(hiddenTrack).toBeTruthy();
    expect(hiddenTrack?.querySelectorAll("a")).toHaveLength(0);
  });

  it("renders a static link list when prefers-reduced-motion is set", () => {
    mockMatchMedia(true);

    render(<CTAWithVerticalMarquee {...baseProps} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    items.forEach((item) => {
      expect(
        screen.getByRole("link", { name: item.label }),
      ).toHaveAttribute("href", item.href);
    });
  });
});
