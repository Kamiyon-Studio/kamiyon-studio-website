import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TestimonialMarquee,
  type TestimonialMarqueeItem,
} from "./testimonial-marquee";

let mockedReduced = false;

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => mockedReduced,
}));

const fixtureOne: TestimonialMarqueeItem = {
  id: "fixture-1",
  name: "Fixture Author",
  quote: "Fixture quote for tests.",
};

const fixtureTwo: TestimonialMarqueeItem = {
  id: "fixture-2",
  name: "Fixture Author Two",
  quote: "Fixture quote two for tests.",
};

const fixtureThree: TestimonialMarqueeItem = {
  id: "fixture-3",
  name: "Fixture Author Three",
  quote: "Fixture quote three for tests.",
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

function columnByIndex(index: "0" | "1" | "2" | "3"): HTMLElement {
  const root = screen.getByTestId("testimonial-marquee");
  const column = root.querySelector(
    `[data-testid="testimonial-marquee-col"][data-col="${index}"]`,
  );
  expect(column).toBeInstanceOf(HTMLElement);
  return column as HTMLElement;
}

describe("TestimonialMarquee", () => {
  beforeEach(() => {
    mockedReduced = false;
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when items is empty", () => {
    const { container } = render(<TestimonialMarquee items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a 3D perspective marquee when motion is allowed", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "marquee");
    expect(root.className).toContain("[perspective:700px]");
    expect(root.className).toContain("justify-center");
    expect(root.className).not.toContain("rounded-lg");
    expect(
      screen.getAllByText("Fixture quote for tests.").length,
    ).toBeGreaterThan(1);
  });

  it("centers the 3D column cluster without a left shift", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    const scroller = screen.getByTestId("testimonial-marquee-scroller");
    expect(scroller.className).toContain("justify-center");
    expect(scroller.style.transform).toContain("translateX(0");
    expect(scroller.style.transform).not.toContain("translateX(-100px)");
  });

  it("covers the section with side margins and only top and bottom fades", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    const root = screen.getByTestId("testimonial-marquee");
    expect(root.className).toMatch(/px-4/);
    expect(root.className).toMatch(/sm:px-6/);
    expect(screen.getByTestId("testimonial-marquee-fade-top")).toBeInTheDocument();
    expect(
      screen.getByTestId("testimonial-marquee-fade-bottom"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("testimonial-marquee-fade-left"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("testimonial-marquee-fade-right"),
    ).not.toBeInTheDocument();

    const scroller = screen.getByTestId("testimonial-marquee-scroller");
    expect(scroller.className).toMatch(/h-\[1[34]0%/);
    expect(scroller.style.transform).toMatch(/scale\(/);
  });

  it("hides extra columns at md and lg when four 3D columns are present", () => {
    render(
      <TestimonialMarquee items={[fixtureOne, fixtureTwo, fixtureThree]} />,
    );

    expect(columnByIndex("1").className).not.toMatch(/\bhidden\b/);
    expect(columnByIndex("2").className).toContain("hidden");
    expect(columnByIndex("2").className).toContain("md:block");
    expect(columnByIndex("3").className).toContain("hidden");
    expect(columnByIndex("3").className).toContain("lg:block");
  });

  it("renders initials and no image when photoUrl is missing", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    expect(screen.getAllByText("FA").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders an allowlisted photo with alt text", () => {
    render(
      <TestimonialMarquee
        items={[
          {
            ...fixtureOne,
            photoUrl: "https://media.kamiyonstudio.com/testimonials/fixture.jpg",
            photoAlt: "Fixture Author portrait",
          },
        ]}
      />,
    );

    const images = screen.getAllByRole("img", {
      name: "Fixture Author portrait",
    });
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]?.getAttribute("src")).toContain(
      encodeURIComponent(
        "https://media.kamiyonstudio.com/testimonials/fixture.jpg",
      ),
    );
  });

  it("renders a static unique-card grid when reduced motion is preferred", () => {
    mockedReduced = true;
    mockMatchMedia(true);

    render(
      <TestimonialMarquee items={[fixtureOne, fixtureTwo, fixtureThree]} />,
    );

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "static");
    expect(screen.getAllByText("Fixture quote for tests.")).toHaveLength(1);
    expect(screen.getAllByText("Fixture quote two for tests.")).toHaveLength(1);
    expect(screen.getAllByText("Fixture quote three for tests.")).toHaveLength(1);
    expect(root.querySelector("[data-slot='marquee']")).toBeNull();
  });
});
