import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  fromToMock,
  setMock,
  registerPluginMock,
  splitTextCtor,
  prefersReducedMotionMock,
} = vi.hoisted(() => {
  const fromToMock = vi.fn<(...args: [unknown, Record<string, unknown>, Record<string, unknown>]) => unknown>(() => ({ kill: vi.fn() }));
  const setMock = vi.fn();
  const registerPluginMock = vi.fn();
  const prefersReducedMotionMock = vi.fn(() => false);

  class MockSplitText {
    chars: HTMLElement[] = [];
    words: HTMLElement[] = [];
    lines: HTMLElement[] = [];
    revert = vi.fn();

    constructor(
      el: HTMLElement,
      options: { onSplit?: (self: MockSplitText) => unknown; type?: string },
    ) {
      this.chars = [el];
      this.words = [el];
      this.lines = [el];
      options.onSplit?.(this);
    }
  }

  return {
    fromToMock,
    setMock,
    registerPluginMock,
    splitTextCtor: MockSplitText,
    prefersReducedMotionMock,
  };
});

vi.mock("@gsap/react", () => ({
  useGSAP: (fn: () => void | (() => void), opts?: { dependencies?: unknown[] }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- vitest mock
    const React = require("react") as typeof import("react");
    React.useEffect(() => {
      const cleanup = fn();
      return typeof cleanup === "function" ? cleanup : undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror useGSAP deps
    }, opts?.dependencies ?? []);
  },
}));

vi.mock("gsap/SplitText", () => ({
  SplitText: splitTextCtor,
}));

vi.mock("@/lib/gsap", () => ({
  gsap: {
    registerPlugin: registerPluginMock,
    fromTo: fromToMock,
    set: setMock,
  },
  ScrollTrigger: {
    getAll: vi.fn(() => []),
  },
}));

vi.mock("@/lib/motion/reduced-motion", () => ({
  prefersReducedMotion: () => prefersReducedMotionMock(),
}));

import { SplitText } from "./SplitText";

describe("SplitText", () => {
  beforeEach(() => {
    fromToMock.mockClear();
    setMock.mockClear();
    prefersReducedMotionMock.mockReturnValue(false);
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { status: "loaded", ready: Promise.resolve() },
    });
  });

  it("renders the text in the requested heading tag", () => {
    render(
      <SplitText tag="h1" text="KAMIYON STUDIO" className="font-display" />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    ).toHaveClass("font-display");
  });

  it("staggers characters when motion is allowed", async () => {
    render(<SplitText tag="h1" text="KAMIYON STUDIO" delay={80} duration={0.6} />);

    await vi.waitFor(() => {
      expect(fromToMock).toHaveBeenCalled();
    });

    const [, , vars] = fromToMock.mock.calls[0]!;
    expect(vars).toMatchObject({
      duration: 0.6,
      stagger: 0.08,
    });
  });

  it("skips stagger animation when reduced motion is preferred", async () => {
    prefersReducedMotionMock.mockReturnValue(true);

    render(<SplitText tag="h1" text="KAMIYON STUDIO" />);

    await vi.waitFor(() => {
      expect(setMock).toHaveBeenCalled();
    });
    expect(fromToMock).not.toHaveBeenCalled();
  });
});
