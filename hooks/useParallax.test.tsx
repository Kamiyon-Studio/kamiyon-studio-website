import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SCROLL_SCRUB_SMOOTH } from "@/lib/motion/constants";

const {
  createScrollTriggerDefaultsMock,
  fromToMock,
  matchMediaAddMock,
  setMock,
} = vi.hoisted(() => {
  const createScrollTriggerDefaultsMock = vi.fn((opts: unknown) => opts);
  const fromToMock = vi.fn();
  const matchMediaAddMock = vi.fn();
  const setMock = vi.fn();

  return {
    createScrollTriggerDefaultsMock,
    fromToMock,
    matchMediaAddMock,
    setMock,
  };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    set: setMock,
    fromTo: fromToMock,
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

import { useParallax } from "./useParallax";

function Harness({ scrub }: { scrub?: boolean | number } = {}) {
  const ref = useParallax<HTMLDivElement>(
    scrub === undefined ? {} : { scrub },
  );
  return <div data-testid="parallax-target" ref={ref} />;
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

describe("useParallax", () => {
  beforeEach(() => {
    createScrollTriggerDefaultsMock.mockClear();
    fromToMock.mockClear();
    matchMediaAddMock.mockClear();
    setMock.mockClear();
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

  it("defaults scrub to SCROLL_SCRUB_SMOOTH on fine pointers", () => {
    render(<Harness />);
    invokeFinePointerCallback();

    expect(createScrollTriggerDefaultsMock).toHaveBeenCalledWith(
      expect.objectContaining({ scrub: SCROLL_SCRUB_SMOOTH }),
    );
    expect(SCROLL_SCRUB_SMOOTH).toBe(0.65);
  });

  it("allows overriding scrub via options", () => {
    render(<Harness scrub={0.2} />);
    invokeFinePointerCallback();

    expect(createScrollTriggerDefaultsMock).toHaveBeenCalledWith(
      expect.objectContaining({ scrub: 0.2 }),
    );
  });

  it("skips animation setup when disabled", () => {
    function DisabledHarness() {
      const ref = useParallax<HTMLDivElement>({ disabled: true });
      return <div ref={ref} />;
    }

    render(<DisabledHarness />);

    expect(matchMediaAddMock).not.toHaveBeenCalled();
    expect(fromToMock).not.toHaveBeenCalled();
  });
});
