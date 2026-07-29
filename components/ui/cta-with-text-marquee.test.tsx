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

const itemsWithImages: VerticalMarqueeItem[] = [
  {
    id: "game-development",
    label: "Game Development",
    href: "/services/game-development",
    images: [
      { src: "/img-front.jpg", alt: "Game dev front" },
      { src: "/img-back.jpg", alt: "Game dev back" },
    ],
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
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
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

  it("uses font-black on service rows (bold, not font-light)", () => {
    const { container } = render(<CTAWithVerticalMarquee {...baseProps} />);

    expect(container.querySelector(".font-black")).toBeInTheDocument();
    expect(container.querySelector(".font-light")).not.toBeInTheDocument();
  });

  it("keeps duplicate marquee track non-interactive", () => {
    const { container } = render(<CTAWithVerticalMarquee {...baseProps} />);

    // Second animated track is aria-hidden for screen readers
    const trackDivs = container.querySelectorAll(
      ".animate-marquee-vertical[aria-hidden='true']",
    );
    expect(trackDivs.length).toBeGreaterThanOrEqual(1);
    // None of the clone nodes should be focusable links
    trackDivs.forEach((track) => {
      expect(track.querySelectorAll("a")).toHaveLength(0);
    });
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

  describe("with images", () => {
    it("renders service row as a link when item has images", () => {
      render(
        <CTAWithVerticalMarquee {...baseProps} items={itemsWithImages} />,
      );

      const link = screen.getByRole("link", { name: "Game Development" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/services/game-development");
    });

    it("renders images in the interactive track when item has images", () => {
      const { container } = render(
        <CTAWithVerticalMarquee {...baseProps} items={itemsWithImages} />,
      );

      // Images live inside the first (interactive) track only
      const interactiveTrack = container.querySelector(
        ".animate-marquee-vertical:not([aria-hidden])",
      );
      const imgs = interactiveTrack?.querySelectorAll("img") ?? [];
      expect(imgs.length).toBe(2);
      // DOM order: back (images[1]) then front (images[0])
      expect(imgs[0]).toHaveAttribute("src", "/img-back.jpg");
      expect(imgs[1]).toHaveAttribute("src", "/img-front.jpg");
    });

    it("keeps clone track image-free when decorative mode is used", () => {
      const { container } = render(
        <CTAWithVerticalMarquee {...baseProps} items={itemsWithImages} />,
      );

      const cloneTrack = container.querySelector(
        ".animate-marquee-vertical[aria-hidden='true']",
      );
      expect(cloneTrack?.querySelectorAll("img")).toHaveLength(0);
    });
  });
});
