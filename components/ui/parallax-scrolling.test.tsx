import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { matchMediaAddMock, setMock, timelineToMock } = vi.hoisted(() => {
  const timelineToMock = vi.fn().mockReturnThis();
  const setMock = vi.fn();
  const matchMediaAddMock = vi.fn();

  return { matchMediaAddMock, setMock, timelineToMock };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    set: setMock,
    timeline: vi.fn(() => ({ to: timelineToMock })),
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

import { ParallaxScrolling } from "./parallax-scrolling";

describe("ParallaxScrolling", () => {
  beforeEach(() => {
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    timelineToMock.mockClear();
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
