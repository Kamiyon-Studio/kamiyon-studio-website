import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LogoMarquee, type LogoMarqueeItem } from "./logo-marquee";

const logos: LogoMarqueeItem[] = [
  {
    id: "acme",
    src: "https://media.kamiyonstudio.com/partners/acme.png",
    alt: "Acme logo",
    label: "Acme",
  },
  {
    id: "placeholder",
    src: null,
    alt: "Partner placeholder",
    label: "Partner placeholder",
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

describe("LogoMarquee", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when logos is empty", () => {
    const { container } = render(<LogoMarquee logos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders partner logo images and label fallbacks without links", () => {
    render(<LogoMarquee logos={logos} />);

    expect(screen.getByTestId("logo-marquee")).toBeInTheDocument();
    const images = screen.getAllByRole("img", { name: "Acme logo" });
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]?.getAttribute("src")).toContain(
      encodeURIComponent("https://media.kamiyonstudio.com/partners/acme.png"),
    );
    expect(screen.getAllByText("Partner placeholder").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("desaturates logos by default and restores color only on that logo hover/focus", () => {
    render(<LogoMarquee logos={logos} />);

    const image = screen.getAllByRole("img", { name: "Acme logo" })[0];
    expect(image?.className).toMatch(/grayscale/);
    expect(image?.className).toMatch(/group-hover\/logo:grayscale-0/);
    expect(image?.className).toMatch(/group-focus-within\/logo:grayscale-0/);
    // Unnamed group-hover would colorize every logo when the track is hovered.
    expect(image?.className).not.toMatch(/\bgroup-hover:grayscale-0\b/);
  });

  it("duplicates the track for a continuous loop and hides the clone", () => {
    render(<LogoMarquee logos={logos} />);

    const root = screen.getByTestId("logo-marquee");
    const clone = root.querySelector('[aria-hidden="true"]');
    expect(clone).not.toBeNull();
    expect(clone?.textContent).toContain("Partner placeholder");
  });

  it("applies horizontal marquee animation unless reduced motion is preferred", () => {
    render(<LogoMarquee logos={logos} speed={35} />);

    const root = screen.getByTestId("logo-marquee");
    const animated = root.querySelector(".animate-marquee-horizontal");
    expect(animated).not.toBeNull();
    expect(animated?.className).toMatch(/motion-reduce:animate-none/);
  });

  it("renders a static single row when prefers-reduced-motion matches", () => {
    mockMatchMedia(true);
    render(<LogoMarquee logos={logos} />);

    const root = screen.getByTestId("logo-marquee");
    expect(root.querySelector(".animate-marquee-horizontal")).toBeNull();
    expect(root.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getAllByRole("img", { name: "Acme logo" })).toHaveLength(1);
  });

  it("accepts custom logo image size classes", () => {
    render(
      <LogoMarquee logos={logos} logoImageClassName="h-8 md:h-9" />,
    );

    const image = screen.getAllByRole("img", { name: "Acme logo" })[0];
    expect(image?.className).toMatch(/\bh-8\b/);
    expect(image?.className).toMatch(/\bmd:h-9\b/);
  });

  it("fades both left and right edges with a horizontal mask", () => {
    render(<LogoMarquee logos={logos} />);

    const root = screen.getByTestId("logo-marquee");
    expect(root.className).toMatch(/mask-image:linear-gradient\(to_right/);
    expect(root.className).toMatch(/-webkit-mask-image:linear-gradient\(to_right/);
  });

  it("does not pause the whole track on hover by default", () => {
    render(<LogoMarquee logos={logos} />);

    const root = screen.getByTestId("logo-marquee");
    expect(root.className).not.toMatch(/group\/track/);
    expect(
      root.querySelector(".animate-marquee-horizontal")?.className,
    ).not.toMatch(/animation-play-state:paused/);
  });
});
