import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img"> & { fill?: boolean; sizes?: string }) => {
    const { fill: _ignoredFill, ...rest } = props;
    void _ignoredFill;
    return createElement("img", rest);
  },
}));

import type { RosterMember, YearRailItem } from "@/lib/timeline";

import { TimelineAside } from "./timeline-aside";

const rail: YearRailItem[] = [
  { year: "2024", firstEntryKey: "a", entryKeys: ["a"] },
  { year: "2025", firstEntryKey: "b", entryKeys: ["b", "c"] },
];

const roster: RosterMember[] = [
  {
    id: "alice",
    name: "Alice Example",
    role: "Designer",
    photo: null,
  },
  {
    id: "bob",
    name: "Bob Example",
    role: "Engineer",
    photo: { src: "/bob.jpg", alt: "Bob" },
  },
];

describe("TimelineAside", () => {
  it("marks the active year and calls onYearSelect", () => {
    const onYearSelect = vi.fn();
    render(
      <TimelineAside
        rail={rail}
        activeYear="2025"
        roster={[]}
        onYearSelect={onYearSelect}
      />,
    );

    const active = screen.getByRole("button", { name: "2025" });
    expect(active).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "2024" })).not.toHaveAttribute(
      "aria-current",
    );

    fireEvent.click(screen.getByRole("button", { name: "2024" }));
    expect(onYearSelect).toHaveBeenCalledWith(rail[0]);
  });

  it("shows the empty roster placeholder", () => {
    render(
      <TimelineAside
        rail={rail}
        activeYear={null}
        roster={[]}
        onYearSelect={() => undefined}
      />,
    );

    expect(
      screen.getByText("The team grows as the story unfolds."),
    ).toBeInTheDocument();
  });

  it("renders initials when photo is missing and an image when present", () => {
    render(
      <TimelineAside
        rail={rail}
        activeYear="2024"
        roster={roster}
        onYearSelect={() => undefined}
      />,
    );

    expect(screen.getByText("AE")).toBeInTheDocument();
    expect(screen.getByAltText("Bob")).toHaveAttribute("src", "/bob.jpg");
  });

  it("exposes roster initials cells as named images", () => {
    render(
      <TimelineAside
        rail={rail}
        activeYear="2024"
        roster={roster}
        onYearSelect={() => undefined}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Alice Example, Designer" }),
    ).toBeInTheDocument();
    // Photo cells use the real <img> alt, not a wrapper role="img".
    expect(screen.getByAltText("Bob")).toBeInTheDocument();
  });
});
