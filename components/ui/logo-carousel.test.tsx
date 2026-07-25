import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnimatedCarousel } from "./logo-carousel";

vi.mock("embla-carousel-react", () => {
  const api = {
    selectedScrollSnap: () => 0,
    scrollSnapList: () => [0, 1],
    scrollTo: vi.fn(),
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    canScrollPrev: () => false,
    canScrollNext: () => true,
    on: vi.fn(),
    off: vi.fn(),
  };

  return {
    default: () => [vi.fn(), api],
  };
});

describe("AnimatedCarousel", () => {
  it("renders provided logos in grayscale that restore color on hover", () => {
    render(
      <AnimatedCarousel
        title="Powering the Web"
        logos={[
          {
            src: "https://media.kamiyonstudio.com/partners/acme.png",
            alt: "Acme",
          },
        ]}
        autoPlay={false}
      />,
    );

    expect(screen.getByText("Powering the Web")).toBeInTheDocument();
    const image = screen.getByRole("img", { name: "Acme" });
    expect(image.className).toMatch(/grayscale/);
    expect(image.className).toMatch(/group-hover:grayscale-0/);
  });

  it("falls back to label text when a logo URL is missing", () => {
    render(
      <AnimatedCarousel
        logos={[{ label: "Partner placeholder" }]}
        autoPlay={false}
      />,
    );

    expect(screen.getByText("Partner placeholder")).toBeInTheDocument();
  });
});
