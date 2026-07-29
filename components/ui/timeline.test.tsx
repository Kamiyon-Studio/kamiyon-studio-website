import { createElement } from "react";
import { render, screen } from "@testing-library/react";
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

import { Timeline, type TimelineEntry } from "./timeline";

const entries: TimelineEntry[] = [
  {
    key: "founded",
    year: "2024",
    dateLabel: "March 2024",
    date: "2024-03-01",
    title: "Studio founded",
    body: "Kamiyon Studio began in Biñan.",
    image: { src: "/assets/background.jpg", alt: "Studio founding" },
  },
  {
    key: "next",
    year: "2025",
    dateLabel: "2025",
    title: "Next chapter",
    body: "Building original IP.",
    image: { src: "/assets/logo.svg", alt: "Kamiyon mark" },
  },
  {
    key: "same-year",
    year: "2025",
    dateLabel: "Late 2025",
    title: "Same year milestone",
    body: "Another beat in 2025.",
    image: { src: "/assets/background.jpg", alt: "Milestone" },
  },
];

describe("Timeline", () => {
  beforeEach(() => {
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    toMock.mockClear();
  });

  it("renders heading, summary, cards, semantic dates, and images", () => {
    render(
      <Timeline heading="Our journey" summary="How we grew." entries={entries} />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Our journey" })).toBeInTheDocument();
    expect(screen.getByText("How we grew.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Studio founded" })).toBeInTheDocument();
    expect(screen.getByText("Kamiyon Studio began in Biñan.")).toBeInTheDocument();

    const dated = screen.getByText("March 2024");
    expect(dated.tagName).toBe("TIME");
    expect(dated).toHaveAttribute("dateTime", "2024-03-01");

    expect(screen.getByText("Late 2025")).toBeInTheDocument();
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
    expect(rail.querySelectorAll("p")).toHaveLength(2);
    expect(rail).toHaveTextContent("2024");
    expect(rail).toHaveTextContent("2025");

    expect(screen.getByTestId("timeline-year-inline-founded")).toHaveClass("xl:hidden");
  });

  it("marks decorative line and dots as aria-hidden", () => {
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
});
