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

function quoteCloneWrappers(quote: string): Element[] {
  const root = screen.getByTestId("testimonial-marquee");
  return [...root.querySelectorAll('[aria-hidden="true"]')].filter((node) =>
    node.textContent?.includes(quote),
  );
}

function columnByIndex(index: "0" | "1" | "2"): HTMLElement {
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

  it("renders a marquee with an aria-hidden clone when one item and motion is allowed", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "marquee");
    expect(
      screen.getAllByText("Fixture quote for tests.").length,
    ).toBeGreaterThanOrEqual(2);
    expect(quoteCloneWrappers("Fixture quote for tests.").length).toBeGreaterThan(
      0,
    );
  });

  it("hides extra columns at md and lg when seven items fill three columns", () => {
    const extras: TestimonialMarqueeItem[] = [4, 5, 6, 7].map((n) => ({
      id: `fixture-${n}`,
      name: `Fixture Author ${n}`,
      quote: `Fixture quote ${n} for tests.`,
    }));

    render(
      <TestimonialMarquee
        items={[fixtureOne, fixtureTwo, fixtureThree, ...extras]}
      />,
    );

    expect(columnByIndex("1").className).toContain("hidden");
    expect(columnByIndex("1").className).toContain("md:block");
    expect(columnByIndex("2").className).toContain("hidden");
    expect(columnByIndex("2").className).toContain("lg:block");
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
    expect(quoteCloneWrappers("Fixture quote for tests.")).toHaveLength(0);
  });
});
