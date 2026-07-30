import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimelineScrollSpy } from "./useTimelineScrollSpy";

const observe = vi.fn();
const disconnect = vi.fn();
const unobserve = vi.fn();

let ioCallback: IntersectionObserverCallback | null = null;
let ObserverCtor: typeof IntersectionObserver | null = null;

class MockIntersectionObserver {
  observe = observe;
  disconnect = disconnect;
  unobserve = unobserve;

  constructor(callback: IntersectionObserverCallback) {
    ioCallback = callback;
    ObserverCtor = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }
}

function mountEntries(keys: string[]) {
  const root = document.createElement("div");
  root.innerHTML = keys
    .map((key) => `<article data-timeline-entry-key="${key}"></article>`)
    .join("");
  document.body.appendChild(root);
  return root;
}

function fireIntersection(
  entries: Array<{ target: Element; intersectionRatio: number }>,
) {
  act(() => {
    ioCallback?.(
      entries.map(({ target, intersectionRatio }) => ({
        target,
        intersectionRatio,
        isIntersecting: intersectionRatio > 0,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: 0,
      })),
      {} as IntersectionObserver,
    );
  });
}

describe("useTimelineScrollSpy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ioCallback = null;
    ObserverCtor = null;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("returns null before the first callback and observes entry nodes", () => {
    const root = mountEntries(["a", "b"]);
    const rootRef = { current: root };

    const { result } = renderHook(() =>
      useTimelineScrollSpy({ rootRef, entryKeys: ["a", "b"] }),
    );

    expect(result.current).toBeNull();
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it("picks the entry with the highest intersection ratio", () => {
    const root = mountEntries(["a", "b", "c"]);
    const rootRef = { current: root };
    const { result } = renderHook(() =>
      useTimelineScrollSpy({ rootRef, entryKeys: ["a", "b", "c"] }),
    );

    const a = root.querySelector('[data-timeline-entry-key="a"]')!;
    const b = root.querySelector('[data-timeline-entry-key="b"]')!;

    fireIntersection([
      { target: a, intersectionRatio: 0.2 },
      { target: b, intersectionRatio: 0.9 },
    ]);

    expect(result.current).toBe("b");
  });

  it("constructs no observer when disabled", () => {
    const root = mountEntries(["a"]);
    const rootRef = { current: root };

    const { result } = renderHook(() =>
      useTimelineScrollSpy({ rootRef, entryKeys: ["a"], disabled: true }),
    );

    expect(result.current).toBeNull();
    expect(observe).not.toHaveBeenCalled();
    expect(ObserverCtor).toBeNull();
    expect(ioCallback).toBeNull();
  });
});
