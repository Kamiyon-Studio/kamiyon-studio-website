import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCROLL_SCRUB_SMOOTH } from "@/lib/motion/constants";

const {
  createScrollTriggerDefaultsMock,
  matchMediaAddMock,
  setMock,
  timelineToMock,
} = vi.hoisted(() => {
  const createScrollTriggerDefaultsMock = vi.fn((opts: unknown) => opts);
  const matchMediaAddMock = vi.fn();
  const setMock = vi.fn();
  const timelineToMock = vi.fn().mockReturnThis();

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

import {
  useLayeredParallax,
  type ParallaxLayerMotion,
} from "./useLayeredParallax";

const LAYERS: readonly ParallaxLayerMotion[] = [
  { layer: "1", yPercent: 40 },
  { layer: "2", yPercent: 20 },
];

function Harness({ disabled = false }: { disabled?: boolean } = {}) {
  const ref = useLayeredParallax<HTMLDivElement>(LAYERS, { disabled });
  return (
    <div data-testid="layered-root" ref={ref}>
      <div data-parallax-layer="1" />
      <div data-parallax-layer="2" />
    </div>
  );
}

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

describe("useLayeredParallax", () => {
  beforeEach(() => {
    createScrollTriggerDefaultsMock.mockClear();
    matchMediaAddMock.mockClear();
    setMock.mockClear();
    timelineToMock.mockClear();
  });

  it("registers reduced-motion and fine-pointer matchMedia gates", () => {
    render(<Harness />);

    const queries = matchMediaAddMock.mock.calls.map(([query]) => query);
    expect(queries).toContain("(prefers-reduced-motion: reduce)");
    expect(queries).toEqual(
      expect.arrayContaining([
        expect.stringContaining("pointer: fine"),
        expect.stringContaining("prefers-reduced-motion: no-preference"),
      ]),
    );
  });

  it("uses SCROLL_SCRUB_SMOOTH for scrubbed layered parallax", () => {
    render(<Harness />);
    invokeFinePointerCallback();

    expect(createScrollTriggerDefaultsMock).toHaveBeenCalledWith(
      expect.objectContaining({ scrub: SCROLL_SCRUB_SMOOTH }),
    );
    expect(SCROLL_SCRUB_SMOOTH).toBe(0.65);
  });

  it("does not use hard scrub 0 or true", () => {
    render(<Harness />);
    invokeFinePointerCallback();

    const scrubArg = createScrollTriggerDefaultsMock.mock.calls[0]?.[0] as {
      scrub?: boolean | number;
    };
    expect(scrubArg.scrub).not.toBe(0);
    expect(scrubArg.scrub).not.toBe(true);
    expect(scrubArg.scrub).toBe(SCROLL_SCRUB_SMOOTH);
  });

  it("skips animation setup when disabled", () => {
    render(<Harness disabled />);

    expect(matchMediaAddMock).not.toHaveBeenCalled();
    expect(createScrollTriggerDefaultsMock).not.toHaveBeenCalled();
  });
});
