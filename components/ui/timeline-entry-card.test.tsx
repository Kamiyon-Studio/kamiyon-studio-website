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

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), null],
}));

import type { TimelineEntryV2 } from "@/lib/timeline";

import { TimelineEntryCard } from "./timeline-entry-card";

const newsEntry: TimelineEntryV2 = {
  key: "founded",
  entryType: "news",
  year: "2024",
  dateLabel: "March 2024",
  date: "2024-03-01",
  title: "Studio founded",
  body: "Kamiyon Studio began in Biñan City with a small team shipping under pressure and learning in public every week.",
  images: [{ src: "/assets/background.jpg", alt: "Founding" }],
};

const joinEntry: TimelineEntryV2 = {
  key: "join-alice",
  entryType: "teamJoin",
  year: "2025",
  dateLabel: "June 2025",
  title: "Alice joins the team!",
  body: "Alice arrives as lead designer.",
  images: [{ src: "/assets/logo.svg", alt: "Alice" }],
  rosterMember: {
    id: "alice",
    name: "Alice",
    role: "Lead Designer",
    photo: null,
  },
};

describe("TimelineEntryCard", () => {
  it("emits the DOM contract data attributes", () => {
    const { container } = render(
      <ol>
        <TimelineEntryCard entry={newsEntry} side="left" anchorId="timeline-founded" />
      </ol>,
    );

    const root = container.querySelector("[data-timeline-entry-key='founded']");
    expect(root).toHaveAttribute("data-timeline-year", "2024");
    expect(root).toHaveAttribute("data-timeline-entry-type", "news");
    expect(root).not.toHaveAttribute("data-timeline-roster-id");
    expect(root).toHaveAttribute("id", "timeline-founded");
  });

  it("includes roster id on teamJoin cards and renders the role eyebrow", () => {
    render(
      <ol>
        <TimelineEntryCard entry={joinEntry} side="right" />
      </ol>,
    );

    const root = screen.getByRole("listitem");
    expect(root).toHaveAttribute("data-timeline-roster-id", "alice");
    expect(screen.getByTestId("timeline-role-eyebrow-join-alice")).toHaveTextContent(
      "Lead Designer",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("uppercase");
  });

  it("does not render a role eyebrow for news entries", () => {
    render(
      <ol>
        <TimelineEntryCard entry={newsEntry} side="left" />
      </ol>,
    );

    expect(screen.queryByTestId("timeline-role-eyebrow-founded")).not.toBeInTheDocument();
  });

  it("toggles read more / read less with aria-expanded", () => {
    render(
      <ol>
        <TimelineEntryCard entry={newsEntry} side="left" />
      </ol>,
    );

    const button = screen.getByRole("button", {
      name: "Read more about Studio founded",
    });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(
      screen.getByRole("button", { name: "Read less about Studio founded" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("applies side alignment classes", () => {
    const { container, rerender } = render(
      <ol>
        <TimelineEntryCard entry={newsEntry} side="left" />
      </ol>,
    );

    expect(container.querySelector("article")?.className).toMatch(/md:text-right/);
    expect(container.querySelector("article")?.className).toMatch(/timeline-zone-gutter-left/);

    rerender(
      <ol>
        <TimelineEntryCard entry={newsEntry} side="right" />
      </ol>,
    );

    expect(container.querySelector("article")?.className).toMatch(/md:text-left/);
    expect(container.querySelector("article")?.className).toMatch(/timeline-zone-gutter-right/);
  });
});
