import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";
import { PartnersMarquee } from "./PartnersMarquee";

vi.mock("embla-carousel-react", () => {
  const api = {
    selectedScrollSnap: () => 0,
    scrollSnapList: () => [0],
    scrollTo: vi.fn(),
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    canScrollPrev: () => false,
    canScrollNext: () => false,
    on: vi.fn(),
    off: vi.fn(),
  };

  return {
    default: () => [vi.fn(), api],
  };
});

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

describe("PARTNER_PLACEHOLDERS", () => {
  it("defines 6–8 static placeholder slots with honest labels", () => {
    expect(PARTNER_PLACEHOLDERS.length).toBeGreaterThanOrEqual(6);
    expect(PARTNER_PLACEHOLDERS.length).toBeLessThanOrEqual(8);
    expect(PARTNER_PLACEHOLDERS.every((slot) => slot.label === "Partner placeholder")).toBe(
      true
    );
    expect(new Set(PARTNER_PLACEHOLDERS.map((slot) => slot.id)).size).toBe(
      PARTNER_PLACEHOLDERS.length
    );
  });
});

describe("PartnersMarquee", () => {
  it("renders each partner placeholder slot once in the logo carousel", () => {
    render(<PartnersMarquee />);

    expect(screen.getAllByText("Partner placeholder")).toHaveLength(
      PARTNER_PLACEHOLDERS.length
    );
  });

  it("renders partner logos as images without links or click actions", () => {
    render(
      <PartnersMarquee
        partners={[
          {
            id: "acme",
            label: "Acme",
            logoUrl: "https://media.kamiyonstudio.com/partners/acme.png",
            logoAlt: "Acme logo",
          },
        ]}
      />,
    );

    const images = screen.getAllByRole("img", { name: "Acme logo" });
    expect(images).toHaveLength(1);
    expect(images[0]?.getAttribute("src")).toContain(
      encodeURIComponent("https://media.kamiyonstudio.com/partners/acme.png"),
    );
    expect(images[0]?.className).not.toMatch(/grayscale/);
    expect(images[0]?.className).toMatch(/opacity-100/);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
  });

  it("renders an optional Trusted by heading when provided", () => {
    render(<PartnersMarquee eyebrow="Trusted by" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Trusted by" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Trusted by" })).toBeInTheDocument();
  });

  it("renders an optional Clients heading when provided", () => {
    render(<PartnersMarquee eyebrow="Clients" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Clients" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Clients" })).toBeInTheDocument();
  });

  it("omits the heading when not provided", () => {
    render(<PartnersMarquee />);

    expect(screen.queryByText("Trusted by")).not.toBeInTheDocument();
    expect(screen.queryByText("Clients")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Partner logos" })).toBeInTheDocument();
  });

  it("exposes the partners carousel track for layout targeting", () => {
    render(<PartnersMarquee />);

    expect(screen.getByTestId("partners-marquee-track")).toBeInTheDocument();
    expect(screen.getByTestId("logo-carousel")).toBeInTheDocument();
  });

  it("uses 2/4 items-per-view with responsive slide gaps so logos never overlap", () => {
    render(<PartnersMarquee />);

    const slides = screen.getAllByRole("group");
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0]?.className).toMatch(/basis-1\/2/);
    expect(slides[0]?.className).toMatch(/lg:basis-1\/4/);
    expect(slides[0]?.className).toMatch(/pl-3/);
    expect(slides[0]?.className).toMatch(/md:pl-4/);
    expect(slides[0]?.className).toMatch(/lg:pl-6/);

    const track = screen.getByTestId("partners-marquee-track");
    const logoCell = track.querySelector(".group");
    expect(logoCell).not.toBeNull();
    expect(logoCell?.className).toMatch(/min-w-0/);
    expect(logoCell?.className).not.toMatch(/min-w-\[10rem\]/);
    expect(logoCell?.className).not.toMatch(/md:min-w-\[12rem\]/);

    const carouselContent = screen
      .getByTestId("logo-carousel")
      .querySelector(".flex");
    expect(carouselContent?.className).toMatch(/-ml-3/);
    expect(carouselContent?.className).toMatch(/md:-ml-4/);
    expect(carouselContent?.className).toMatch(/lg:-ml-6/);
  });

  it("keeps Container horizontal padding and avoids double-padding the carousel inset", () => {
    render(<PartnersMarquee />);

    const section = screen.getByRole("region", { name: "Partner logos" });
    const container = section.firstElementChild;
    expect(container?.className).toMatch(/\bpx-4\b/);
    expect(container?.className).toMatch(/\bsm:px-6\b/);
    expect(container?.className).toMatch(/\blg:px-8\b/);

    const track = screen.getByTestId("partners-marquee-track");
    const doublePaddedInset = Array.from(track.querySelectorAll("*")).find(
      (el) =>
        /\bcontainer\b/.test(el.className) && /\bpx-4\b/.test(el.className),
    );
    expect(doublePaddedInset).toBeUndefined();
  });

  it("defaults to section layout on light: secondary background, large padding, light nav theme", () => {
    render(<PartnersMarquee />);

    const section = screen.getByRole("region", { name: "Partner logos" });
    expect(section.id).toBe("home-partners");
    expect(section.getAttribute("data-nav-theme")).toBe("light");
    expect(section.className).toMatch(/bg-\[var\(--bg-secondary\)\]/);
    expect(section.className).toMatch(/py-12/);
    expect(section.className).toMatch(/md:py-16/);
  });

  it("band layout uses compact dark band without secondary background or large padding", () => {
    render(<PartnersMarquee layout="band" />);

    const section = screen.getByRole("region", { name: "Partner logos" });
    expect(section.id).toBe("home-partners");
    expect(section.getAttribute("data-nav-theme")).toBe("dark");
    expect(section.className).not.toMatch(/bg-\[var\(--bg-secondary\)\]/);
    expect(section.className).not.toMatch(/py-12/);
    expect(section.className).not.toMatch(/md:py-16/);
  });

  it("band layout renders Trusted by as an h3 when eyebrow is passed", () => {
    render(<PartnersMarquee layout="band" tone="onDark" eyebrow="Trusted by" />);

    const heading = screen.getByRole("heading", { level: 3, name: "Trusted by" });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toMatch(/text-sakura-ink/);
    expect(heading.className).toMatch(/uppercase/);
    expect(screen.getByRole("region", { name: "Trusted by" })).toBeInTheDocument();
  });

  it("keeps partner logos in original color without invert overlay", () => {
    render(
      <PartnersMarquee
        tone="onDark"
        partners={[
          {
            id: "acme",
            label: "Acme",
            logoUrl: "https://media.kamiyonstudio.com/partners/acme.png",
            logoAlt: "Acme logo",
          },
        ]}
      />,
    );

    const image = screen.getByRole("img", { name: "Acme logo" });
    const toneClasses = [image.className, image.parentElement?.className ?? ""].join(
      " ",
    );
    expect(toneClasses).not.toMatch(/invert|brightness/);
    expect(image.className).not.toMatch(/grayscale/);
  });
});
