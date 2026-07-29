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

  it("applies responsive slide gaps and fluid logo cells that respect slide basis", () => {
    render(
      <AnimatedCarousel
        logos={[{ label: "A" }, { label: "B" }]}
        autoPlay={false}
        itemsPerViewMobile={2}
        itemsPerViewDesktop={4}
        itemGap="md"
        logoContainerWidth="w-full"
        logoContainerMinWidth="min-w-0"
        contentClassName="w-full"
      />,
    );

    const slides = screen.getAllByRole("group");
    expect(slides[0]?.className).toMatch(/basis-1\/2/);
    expect(slides[0]?.className).toMatch(/lg:basis-1\/4/);
    expect(slides[0]?.className).toMatch(/pl-3/);
    expect(slides[0]?.className).toMatch(/md:pl-4/);
    expect(slides[0]?.className).toMatch(/lg:pl-6/);

    const logoCell = screen.getByText("A");
    expect(logoCell.className).toMatch(/min-w-0/);
    expect(logoCell.className).not.toMatch(/min-w-\[10rem\]/);

    const carouselContent = screen
      .getByTestId("logo-carousel")
      .querySelector(".flex");
    expect(carouselContent?.className).toMatch(/-ml-3/);
    expect(carouselContent?.className).toMatch(/md:-ml-4/);
    expect(carouselContent?.className).toMatch(/lg:-ml-6/);
  });
});
