import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const scrollTo = vi.fn();
const scrollPrev = vi.fn();
const scrollNext = vi.fn();
const on = vi.fn();
const off = vi.fn();

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img"> & { fill?: boolean; sizes?: string }) => {
    const { fill: _ignoredFill, ...rest } = props;
    void _ignoredFill;
    return createElement("img", rest);
  },
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [
    vi.fn(),
    {
      selectedScrollSnap: () => 0,
      scrollSnapList: () => [0, 1, 2],
      scrollTo,
      scrollPrev,
      scrollNext,
      canScrollPrev: () => false,
      canScrollNext: () => true,
      on,
      off,
    },
  ],
}));

import { TimelineEntryMedia } from "./timeline-entry-media";

describe("TimelineEntryMedia", () => {
  it("renders a single image without counter or dots", () => {
    render(
      <TimelineEntryMedia
        entryKey="one"
        images={[{ src: "/a.jpg", alt: "Solo" }]}
      />,
    );

    expect(screen.getByAltText("Solo")).toBeInTheDocument();
    expect(screen.queryByTestId("timeline-media-counter-one")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show image/ })).not.toBeInTheDocument();
  });

  it("renders a counter and dots for multiple images", () => {
    render(
      <TimelineEntryMedia
        entryKey="multi"
        images={[
          { src: "/a.jpg", alt: "One" },
          { src: "/b.jpg", alt: "Two" },
          { src: "/c.jpg", alt: "Three" },
        ]}
      />,
    );

    const carousel = screen.getByRole("region", { name: "Timeline entry images" });
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByTestId("timeline-media-counter-multi")).toHaveTextContent("1/3");
    expect(screen.getAllByRole("button", { name: /Show image/ })).toHaveLength(3);
  });

  it("marks the active dot and scrolls on click", () => {
    render(
      <TimelineEntryMedia
        entryKey="multi"
        images={[
          { src: "/a.jpg", alt: "One" },
          { src: "/b.jpg", alt: "Two" },
          { src: "/c.jpg", alt: "Three" },
        ]}
      />,
    );

    const first = screen.getByRole("button", { name: "Show image 1" });
    const second = screen.getByRole("button", { name: "Show image 2" });
    expect(first).toHaveAttribute("aria-current", "true");
    expect(second).not.toHaveAttribute("aria-current");

    fireEvent.click(second);
    expect(scrollTo).toHaveBeenCalledWith(1);
  });
});
