import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { matchMediaAddMock, setMock, toMock } = vi.hoisted(() => {
  const toMock = vi.fn().mockReturnThis();
  const setMock = vi.fn();
  const matchMediaAddMock = vi.fn();
  return { matchMediaAddMock, setMock, toMock };
});

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img"> & { fill?: boolean; sizes?: string }) => {
    const { fill: _ignoredFill, ...rest } = props;
    void _ignoredFill;
    return createElement("img", rest);
  },
}));

vi.mock("@/components/ui/WordPullUp", () => ({
  WordPullUp: ({
    words,
    as: Tag = "h1",
    id,
    className,
  }: {
    words: string;
    as?: "h1" | "h2" | "h3";
    id?: string;
    className?: string;
  }) => createElement(Tag, { id, className }, words),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), null],
}));

vi.mock("@/lib/gsap", () => ({
  gsap: {
    set: setMock,
    to: toMock,
    matchMedia: vi.fn(() => ({
      add: matchMediaAddMock,
    })),
  },
  createScrollTriggerDefaults: vi.fn((opts: unknown) => opts),
  GSAP_ALLOW_MOTION: "(prefers-reduced-motion: no-preference)",
  GSAP_REDUCE_MOTION: "(prefers-reduced-motion: reduce)",
  ensureGsapPlugins: vi.fn(),
}));

vi.mock("@/hooks/useGsapContext", () => ({
  useGsapContext: (_scope: unknown, createAnimations: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- vitest mock
    const React = require("react") as typeof import("react");
    React.useLayoutEffect(() => {
      createAnimations();
    }, [createAnimations]);
  },
}));

import type { TimelineEntryV2 } from "@/lib/timeline";

import { Timeline } from "./timeline";

const entries: TimelineEntryV2[] = [
  {
    key: "founded",
    entryType: "news",
    year: "2024",
    dateLabel: "March 2024",
    date: "2024-03-01",
    title: "Studio founded",
    body: "Kamiyon Studio began in Biñan.",
    images: [{ src: "/assets/background.jpg", alt: "Studio founding" }],
  },
  {
    key: "next",
    entryType: "news",
    year: "2025",
    dateLabel: "2025",
    title: "Next chapter",
    body: "Building original IP.",
    images: [{ src: "/assets/logo.svg", alt: "Kamiyon mark" }],
  },
  {
    key: "same-year",
    entryType: "news",
    year: "2025",
    dateLabel: "Late 2025",
    title: "Same year milestone",
    body: "Another beat in 2025.",
    images: [{ src: "/assets/background.jpg", alt: "Milestone" }],
  },
];

const mixedEntries: TimelineEntryV2[] = [
  ...entries.slice(0, 1),
  {
    key: "join-alice",
    entryType: "teamJoin",
    year: "2025",
    dateLabel: "June 2025",
    title: "Alice joins the team!",
    body: "Welcome Alice.",
    images: [{ src: "/assets/logo.svg", alt: "Alice" }],
    rosterMember: {
      id: "alice",
      name: "Alice Example",
      role: "Designer",
      photo: null,
    },
  },
];

describe("Timeline", () => {
  beforeEach(() => {
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    toMock.mockClear();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders heading, summary, cards, semantic dates, and images", () => {
    render(
      <Timeline heading="Our journey" summary="How we grew." entries={entries} />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Our journey" })).toBeInTheDocument();
    expect(screen.getByText("How we grew.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Studio founded" })).toBeInTheDocument();
    expect(screen.getByText("Kamiyon Studio began in Biñan.")).toBeInTheDocument();

    const dated = document.querySelector('time[dateTime="2024-03-01"]');
    expect(dated).toBeInTheDocument();
    expect(dated).toHaveTextContent("March 2024");

    expect(screen.getAllByText("Late 2025").length).toBeGreaterThan(0);
    expect(screen.getByAltText("Studio founding")).toHaveAttribute("src", "/assets/background.jpg");
  });

  it("derives card side from array order and lists unique years on the rail", () => {
    const { container } = render(
      <Timeline heading="Our journey" summary="" entries={entries} />,
    );

    expect(container.querySelector('[data-timeline-side="left"]')).toBeInTheDocument();
    expect(container.querySelector('[data-timeline-side="right"]')).toBeInTheDocument();

    const rail = screen.getByTestId("timeline-year-rail");
    expect(rail).toHaveClass("xl:block");
    expect(rail.querySelectorAll("button")).toHaveLength(2);
    expect(rail).toHaveTextContent("2024");
    expect(rail).toHaveTextContent("2025");

    expect(screen.getByTestId("timeline-year-inline-founded")).toHaveClass("xl:hidden");
  });

  it("marks decorative line as aria-hidden", () => {
    const { container } = render(
      <Timeline heading="Our journey" summary="" entries={entries} />,
    );

    const line = container.querySelector("[data-timeline-progress]")?.parentElement;
    expect(line).toHaveAttribute("aria-hidden", "true");
  });

  it("shows empty state without cards when entries are empty", () => {
    render(
      <Timeline heading="Our journey" summary="Coming soon." entries={[]} />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Our journey" })).toBeInTheDocument();
    expect(screen.getByText("Coming soon.")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-empty")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("registers reduced-motion and allow-motion GSAP handlers", () => {
    render(
      <Timeline heading="Our journey" summary="" entries={entries} />,
    );

    expect(matchMediaAddMock).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
      expect.any(Function),
    );
    expect(matchMediaAddMock).toHaveBeenCalledWith(
      "(prefers-reduced-motion: no-preference)",
      expect.any(Function),
    );
  });

  it("scrolls to the first entry of a year when a rail button is clicked", () => {
    render(
      <Timeline heading="Our journey" summary="" entries={entries} />,
    );

    fireEvent.click(screen.getByTestId("timeline-year-rail").querySelector("button")!);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders an empty roster for news-only entries and cells for mixed sets", () => {
    const { rerender } = render(
      <Timeline heading="Our journey" summary="" entries={entries} />,
    );

    expect(
      screen.getByText("The team grows as the story unfolds."),
    ).toBeInTheDocument();

    rerender(
      <Timeline heading="Our journey" summary="" entries={mixedEntries} />,
    );

    // Global IntersectionObserver stub reports intersecting → roster fills.
    expect(screen.getByLabelText(/Alice Example/)).toBeInTheDocument();
  });
});
