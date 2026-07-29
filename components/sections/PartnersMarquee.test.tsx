import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";
import { PartnersMarquee } from "./PartnersMarquee";

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
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders each partner placeholder slot in the continuous logo marquee", () => {
    render(<PartnersMarquee />);

    // Primary track + aria-hidden clone both render labels.
    expect(screen.getAllByText("Partner placeholder").length).toBeGreaterThanOrEqual(
      PARTNER_PLACEHOLDERS.length,
    );
  });

  it("renders partner logos as larger desaturated images without links", () => {
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
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]?.getAttribute("src")).toContain(
      encodeURIComponent("https://media.kamiyonstudio.com/partners/acme.png"),
    );
    expect(images[0]?.className).toMatch(/grayscale/);
    expect(images[0]?.className).toMatch(/group-hover\/logo:grayscale-0/);
    expect(images[0]?.className).toMatch(/h-\[2\.625rem\]/);
    expect(images[0]?.className).toMatch(/md:h-12/);
    expect(images[0]?.className).toMatch(/lg:h-\[3\.75rem\]/);
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

  it("exposes the partners continuous marquee track", () => {
    render(<PartnersMarquee />);

    expect(screen.getByTestId("partners-marquee-track")).toBeInTheDocument();
    expect(screen.getByTestId("logo-marquee")).toBeInTheDocument();
    expect(
      screen.getByTestId("logo-marquee").querySelector(".animate-marquee-horizontal"),
    ).not.toBeNull();
  });

  it("keeps Container horizontal padding without Embla slide-basis layout", () => {
    render(<PartnersMarquee />);

    const section = screen.getByRole("region", { name: "Partner logos" });
    const container = section.firstElementChild;
    expect(container?.className).toMatch(/\bpx-4\b/);
    expect(container?.className).toMatch(/\bsm:px-6\b/);
    expect(container?.className).toMatch(/\blg:px-8\b/);

    expect(screen.queryByTestId("logo-carousel")).not.toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
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

  it("keeps partner logos without invert overlay while using grayscale idle treatment", () => {
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

    const image = screen.getAllByRole("img", { name: "Acme logo" })[0];
    const toneClasses = [image?.className ?? "", image?.parentElement?.className ?? ""].join(
      " ",
    );
    expect(toneClasses).not.toMatch(/invert|brightness/);
    expect(image?.className).toMatch(/grayscale/);
    expect(image?.className).toMatch(/group-hover\/logo:grayscale-0/);
  });
});
