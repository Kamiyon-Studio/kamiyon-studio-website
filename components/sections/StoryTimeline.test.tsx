import { render, screen } from "@testing-library/react";
import { createElement } from "react";
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

vi.mock("@/hooks/useGsapContext", () => ({
  useGsapContext: () => undefined,
}));

import { StoryTimeline } from "./StoryTimeline";
import type { TimelineEntryV2 } from "@/lib/timeline";

const sample: TimelineEntryV2[] = [
  {
    key: "founded",
    entryType: "news",
    year: "2024",
    dateLabel: "March 2024",
    date: "2024-03-01",
    title: "Studio founded",
    body: "Kamiyon Studio began.",
    images: [{ src: "/assets/background.jpg", alt: "Founding" }],
  },
];

describe("StoryTimeline", () => {
  it("renders heading and summary even with an empty entries array", () => {
    render(
      <StoryTimeline
        heading="Our journey"
        summary="Milestones as they earn a place here."
        entries={[]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Our journey" })).toBeInTheDocument();
    expect(screen.getByText("Milestones as they earn a place here.")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-empty")).toBeInTheDocument();
    expect(document.getElementById("timeline")).toBeInTheDocument();
  });

  it("passes entries through to the timeline cards", () => {
    render(
      <StoryTimeline heading="Our journey" summary="Summary" entries={sample} />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Studio founded" })).toBeInTheDocument();
    expect(screen.getByText("Kamiyon Studio began.")).toBeInTheDocument();
  });
});
