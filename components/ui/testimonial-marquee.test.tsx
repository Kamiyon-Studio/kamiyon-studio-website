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

  it("renders one static featured card without a loop clone", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "static");
    expect(screen.getByText("Fixture quote for tests.")).toBeInTheDocument();
    expect(screen.getByText("Fixture Author")).toBeInTheDocument();
    expect(screen.getAllByText("Fixture quote for tests.")).toHaveLength(1);
    expect(quoteCloneWrappers("Fixture quote for tests.")).toHaveLength(0);
  });

  it("renders two static cards without looping", () => {
    render(<TestimonialMarquee items={[fixtureOne, fixtureTwo]} />);

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "static");
    expect(screen.getByText("Fixture Author")).toBeInTheDocument();
    expect(screen.getByText("Fixture Author Two")).toBeInTheDocument();
    expect(screen.getAllByText("Fixture quote for tests.")).toHaveLength(1);
    expect(screen.getAllByText("Fixture quote two for tests.")).toHaveLength(1);
  });

  it("renders a three-column marquee with an aria-hidden clone track", () => {
    render(
      <TestimonialMarquee items={[fixtureOne, fixtureTwo, fixtureThree]} />,
    );

    const root = screen.getByTestId("testimonial-marquee");
    expect(root).toHaveAttribute("data-mode", "marquee");
    expect(
      screen.getAllByText("Fixture quote for tests.").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("Fixture quote two for tests.").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("Fixture quote three for tests.").length,
    ).toBeGreaterThanOrEqual(2);
    expect(quoteCloneWrappers("Fixture quote for tests.").length).toBeGreaterThan(
      0,
    );
  });

  it("renders initials and no image when photoUrl is missing", () => {
    render(<TestimonialMarquee items={[fixtureOne]} />);

    expect(screen.getByText("FA")).toBeInTheDocument();
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

    const image = screen.getByRole("img", { name: "Fixture Author portrait" });
    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toContain(
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
