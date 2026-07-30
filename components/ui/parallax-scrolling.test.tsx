import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCROLL_SCRUB_SMOOTH } from "@/lib/motion/constants";

const {
  createScrollTriggerDefaultsMock,
  matchMediaAddMock,
  setMock,
  timelineToMock,
} = vi.hoisted(() => {
  const createScrollTriggerDefaultsMock = vi.fn((opts: unknown) => opts);
  const timelineToMock = vi.fn().mockReturnThis();
  const setMock = vi.fn();
  const matchMediaAddMock = vi.fn();

  return {
    createScrollTriggerDefaultsMock,
    matchMediaAddMock,
    setMock,
    timelineToMock,
  };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    set: setMock,
    timeline: vi.fn(() => ({ to: timelineToMock })),
    matchMedia: vi.fn(() => ({
      add: matchMediaAddMock,
    })),
  },
  createScrollTriggerDefaults: createScrollTriggerDefaultsMock,
  GSAP_ALLOW_MOTION: "(prefers-reduced-motion: no-preference)",
  GSAP_REDUCE_MOTION: "(prefers-reduced-motion: reduce)",
  ensureGsapPlugins: vi.fn(),
}));

vi.mock("@/hooks/useGsapContext", () => ({
  useGsapContext: (
    _scope: unknown,
    createAnimations: () => void,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- vitest mock
    const React = require("react") as typeof import("react");
    React.useLayoutEffect(() => {
      createAnimations();
    }, [createAnimations]);
  },
}));

vi.mock("lucide-react", () => ({
  Sparkles: (props: Record<string, unknown>) => (
    <svg data-testid="sparkles-icon" {...props} />
  ),
}));

import { ParallaxScrolling } from "./parallax-scrolling";

function invokeFinePointerCallback() {
  const fineCall = matchMediaAddMock.mock.calls.find(
    ([query]) =>
      typeof query === "string" &&
      query.includes("pointer: fine") &&
      query.includes("prefers-reduced-motion: no-preference"),
  );
  expect(fineCall).toBeDefined();
  const callback = fineCall?.[1] as (() => void) | undefined;
  expect(callback).toEqual(expect.any(Function));
  callback?.();
}

describe("ParallaxScrolling", () => {
  beforeEach(() => {
    createScrollTriggerDefaultsMock.mockClear();
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    timelineToMock.mockClear();
  });

  it("registers reduced-motion and fine-pointer matchMedia gates", () => {
    render(<ParallaxScrolling />);

    const queries = matchMediaAddMock.mock.calls.map(([query]) => query);
    expect(queries).toContain("(prefers-reduced-motion: reduce)");
    expect(queries).toEqual(
      expect.arrayContaining([
        expect.stringContaining("pointer: fine"),
        expect.stringContaining("prefers-reduced-motion: no-preference"),
      ]),
    );
  });

  it("uses SCROLL_SCRUB_SMOOTH for scrubbed layer timeline", () => {
    render(<ParallaxScrolling />);
    invokeFinePointerCallback();

    expect(createScrollTriggerDefaultsMock).toHaveBeenCalledWith(
      expect.objectContaining({ scrub: SCROLL_SCRUB_SMOOTH }),
    );
    expect(SCROLL_SCRUB_SMOOTH).toBe(0.65);

    const scrubArg = createScrollTriggerDefaultsMock.mock.calls[0]?.[0] as {
      scrub?: boolean | number;
    };
    expect(scrubArg.scrub).not.toBe(0);
    expect(scrubArg.scrub).not.toBe(true);
  });

  it("renders the default title as presentational text (not a heading)", () => {
    const { container } = render(<ParallaxScrolling />);

    expect(screen.getByText("Parallax")).toBeInTheDocument();
    expect(container.querySelector(".parallax__title")?.tagName).toBe("P");
    expect(
      screen.queryByRole("heading", { name: "Parallax" }),
    ).not.toBeInTheDocument();
  });

  it("renders a custom title as presentational text", () => {
    const { container } = render(<ParallaxScrolling title="Depth Demo" />);

    expect(screen.getByText("Depth Demo")).toBeInTheDocument();
    expect(container.querySelector(".parallax__title")?.tagName).toBe("P");
    expect(
      screen.queryByRole("heading", { name: "Depth Demo" }),
    ).not.toBeInTheDocument();
  });

  it("exposes data-parallax-layer attributes for layers 1–4", () => {
    const { container } = render(<ParallaxScrolling />);

    expect(container.querySelector("[data-parallax-layers]")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-parallax-layer]")).toHaveLength(4);
    expect(container.querySelector('[data-parallax-layer="1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-parallax-layer="2"]')).toBeInTheDocument();
    expect(container.querySelector('[data-parallax-layer="3"]')).toBeInTheDocument();
    expect(container.querySelector('[data-parallax-layer="4"]')).toBeInTheDocument();
  });

  it("uses local /assets image sources only", () => {
    const { container } = render(<ParallaxScrolling />);
    const images = Array.from(container.querySelectorAll("img"));

    expect(images.length).toBeGreaterThanOrEqual(3);
    for (const img of images) {
      const src = img.getAttribute("src") ?? "";
      // next/image may emit /_next/image?url=%2Fassets%2F... in tests
      const decoded =
        src.startsWith("/_next/image") ?
          decodeURIComponent(
            new URL(src, "http://localhost").searchParams.get("url") ?? "",
          )
        : src;
      expect(decoded).toMatch(/^\/assets\//);
    }
  });

  it("shows the content mark by default", () => {
    const { container } = render(<ParallaxScrolling />);

    expect(
      container.querySelector("[data-parallax-content-mark]"),
    ).toBeInTheDocument();
  });

  it("hides the content mark when showContentMark is false", () => {
    const { container } = render(<ParallaxScrolling showContentMark={false} />);

    expect(
      container.querySelector("[data-parallax-content-mark]"),
    ).not.toBeInTheDocument();
  });

  it("merges an optional className on the root", () => {
    const { container } = render(<ParallaxScrolling className="mt-8" />);

    expect(container.querySelector(".parallax")).toHaveClass("mt-8");
  });
});
