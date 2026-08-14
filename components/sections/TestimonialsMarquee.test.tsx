import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Testimonial } from "@/lib/cms/types";
import { TestimonialsMarquee } from "./TestimonialsMarquee";

vi.mock("@/components/ui/testimonial-marquee", () => ({
  TestimonialMarquee: ({
    items,
  }: {
    items: { id: string; name: string; quote: string }[];
  }) => (
    <div data-testid="testimonial-marquee">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}
            {item.quote}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

function makeTestimonial(
  overrides: Partial<Testimonial> & Pick<Testimonial, "id">,
): Testimonial {
  return {
    _type: "testimonial",
    quote: "Fixture quote for tests.",
    name: "Fixture Author",
    order: 1,
    ...overrides,
  };
}

describe("TestimonialsMarquee", () => {
  it("renders heading Kind words, eyebrow Testimonials, and dark nav theme", () => {
    const { container } = render(
      <TestimonialsMarquee
        testimonials={[makeTestimonial({ id: "fixture-a" })]}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Kind words" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();

    const section = container.querySelector("#home-testimonials");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-nav-theme", "dark");
  });

  it("centers the header cluster", () => {
    render(
      <TestimonialsMarquee
        testimonials={[makeTestimonial({ id: "fixture-a" })]}
      />,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Kind words" });
    const cluster = heading.parentElement;

    expect(cluster?.className).toMatch(/text-center/);
    expect(cluster?.className).toMatch(/mx-auto/);
  });

  it("renders the marquee full-bleed on the section, not inside a max-width container", () => {
    const { container } = render(
      <TestimonialsMarquee
        testimonials={[makeTestimonial({ id: "fixture-a" })]}
      />,
    );

    const section = container.querySelector("#home-testimonials");
    const marquee = screen.getByTestId("testimonial-marquee");

    expect(section).not.toBeNull();
    expect(section?.className).toMatch(/overflow-hidden/);
    expect(section?.querySelector(".max-w-7xl")).toBeNull();
    expect(marquee.parentElement).toBe(section);
  });

  it("preserves homePage.testimonials array order (does not re-sort by document.order)", () => {
    render(
      <TestimonialsMarquee
        testimonials={[
          makeTestimonial({
            id: "fixture-b",
            name: "Fixture Author B",
            order: 2,
          }),
          makeTestimonial({
            id: "fixture-a",
            name: "Fixture Author A",
            order: 1,
          }),
        ]}
      />,
    );

    const names = within(screen.getByTestId("testimonial-marquee"))
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(names[0]).toContain("Fixture Author B");
    expect(names[1]).toContain("Fixture Author A");
  });

  it("renders nothing when there are no testimonials", () => {
    const { container } = render(<TestimonialsMarquee testimonials={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders an optional summary", () => {
    render(
      <TestimonialsMarquee
        testimonials={[makeTestimonial({ id: "fixture-a" })]}
        summary="Fixture summary for the testimonials band."
      />,
    );

    expect(
      screen.getByText("Fixture summary for the testimonials band."),
    ).toBeInTheDocument();
  });
});
