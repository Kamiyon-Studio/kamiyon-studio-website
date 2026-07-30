import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { matchMediaAddMock, setMock, fromToMock } = vi.hoisted(() => {
  const fromToMock = vi.fn(() => ({ play: vi.fn(), kill: vi.fn() }));
  const setMock = vi.fn();
  const matchMediaAddMock = vi.fn();
  return { matchMediaAddMock, setMock, fromToMock };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    set: setMock,
    fromTo: fromToMock,
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

import {
  MOTION_DISTANCE,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
} from "@/lib/motion/constants";

import { WordPullUp } from "./WordPullUp";

function callAllowMotion() {
  const allowMotion = matchMediaAddMock.mock.calls.find(
    ([query]) =>
      typeof query === "string" && query.includes("no-preference"),
  )?.[1] as (() => void) | undefined;
  expect(allowMotion).toBeTypeOf("function");
  allowMotion!();
}

function callReduceMotion() {
  const reduceMotion = matchMediaAddMock.mock.calls.find(
    ([query]) =>
      typeof query === "string" && query.includes("reduce"),
  )?.[1] as (() => void) | undefined;
  expect(reduceMotion).toBeTypeOf("function");
  reduceMotion!();
}

describe("WordPullUp", () => {
  beforeEach(() => {
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    fromToMock.mockClear();
  });

  it("renders each word from the heading string", () => {
    render(
      <WordPullUp
        as="h2"
        words="Recent Projects"
        className="mt-3"
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Recent Projects",
    });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("mt-3");
  });

  it("applies the cinematic display heading treatment by default", () => {
    render(<WordPullUp as="h2" words="Recent Projects" />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("footer-text-glow");
    expect(heading).toHaveClass("font-display");
    expect(heading).toHaveClass("text-5xl");
    expect(heading).toHaveClass("font-black");
    expect(heading).toHaveClass("tracking-tighter");
    expect(heading).toHaveClass("md:text-8xl");
  });

  it("forwards id for aria-labelledby targets", () => {
    render(<WordPullUp as="h2" id="section-heading" words="What we build" />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "section-heading",
    );
  });

  it("preserves word spacing in heading text", () => {
    render(<WordPullUp as="h1" words="Create  Play" startOnView={false} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/Create\s+Play/);
  });

  // Markup must not branch on motion preference: branching during render made
  // the server and client trees disagree and React discarded the homepage tree.
  it("renders the same word spans regardless of motion preference", () => {
    const { container } = render(
      <WordPullUp as="h2" words="Recent Projects" startOnView={false} />,
    );

    const wordSpans = container.querySelectorAll(".word-pull-up-word");
    expect(wordSpans).toHaveLength(2);
    expect(wordSpans[0]?.textContent).toBe("Recent");
    expect(wordSpans[1]?.textContent).toBe("Projects");
  });

  // Accessible-name computation trims each element's own text, so a separator
  // kept inside a word span is dropped and the heading announces as "RecentProjects".
  it("keeps word separators outside the spans so the name is not run together", () => {
    render(<WordPullUp as="h2" words="Meet the team" startOnView={false} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Meet the team" }),
    ).toBeInTheDocument();
  });

  it("registers reduced-motion and allow-motion GSAP handlers", () => {
    render(<WordPullUp as="h2" words="Recent Projects" />);

    expect(matchMediaAddMock).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
      expect.any(Function),
    );
    expect(matchMediaAddMock).toHaveBeenCalledWith(
      "(prefers-reduced-motion: no-preference)",
      expect.any(Function),
    );
  });

  it("keeps words visible under reduced-motion", () => {
    render(<WordPullUp as="h2" words="Recent Projects" />);

    callReduceMotion();

    expect(setMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ autoAlpha: 1, y: 0 }),
    );
    expect(fromToMock).not.toHaveBeenCalled();
  });

  it("stagger pull-up uses MOTION_* and createScrollTriggerDefaults on view", async () => {
    const { createScrollTriggerDefaults } = await import("@/lib/gsap");

    render(<WordPullUp as="h2" words="Recent Projects" />);

    callAllowMotion();

    expect(fromToMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        autoAlpha: 0,
        y: MOTION_DISTANCE.staggerY,
      }),
      expect.objectContaining({
        autoAlpha: 1,
        y: 0,
        duration: MOTION_DURATION.base,
        ease: MOTION_EASE.out,
        stagger: MOTION_STAGGER.base,
        scrollTrigger: expect.objectContaining({
          once: true,
        }),
      }),
    );

    expect(createScrollTriggerDefaults).toHaveBeenCalledWith(
      expect.objectContaining({
        once: true,
        trigger: expect.any(HTMLElement),
      }),
    );

    // Omit `start` so createScrollTriggerDefaults applies SCROLL_TRIGGER_START.
    const defaultsCall = vi.mocked(createScrollTriggerDefaults).mock
      .calls.at(-1)?.[0] as { start?: string } | undefined;
    expect(defaultsCall?.start).toBeUndefined();
  });

  it("honors delayMultiple override for stagger", () => {
    render(
      <WordPullUp as="h2" words="Recent Projects" delayMultiple={0.2} />,
    );

    callAllowMotion();

    expect(fromToMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        stagger: 0.2,
      }),
    );
  });

  it("plays immediately without ScrollTrigger when startOnView is false", async () => {
    const { createScrollTriggerDefaults } = await import("@/lib/gsap");
    vi.mocked(createScrollTriggerDefaults).mockClear();

    render(
      <WordPullUp as="h2" words="Recent Projects" startOnView={false} />,
    );

    callAllowMotion();

    expect(fromToMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        autoAlpha: 0,
        y: MOTION_DISTANCE.staggerY,
      }),
      expect.objectContaining({
        autoAlpha: 1,
        y: 0,
        duration: MOTION_DURATION.base,
        ease: MOTION_EASE.out,
        stagger: MOTION_STAGGER.base,
      }),
    );

    const tweenVars = fromToMock.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(tweenVars.scrollTrigger).toBeUndefined();
    expect(createScrollTriggerDefaults).not.toHaveBeenCalled();
  });
});
