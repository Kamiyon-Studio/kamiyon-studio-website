import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSectionSpy } from "./useSectionSpy";

const observe = vi.fn();
const disconnect = vi.fn();
const unobserve = vi.fn();

let ioCallback: IntersectionObserverCallback | null = null;
let ioOptions: IntersectionObserverInit | undefined;

class MockIntersectionObserver {
  observe = observe;
  disconnect = disconnect;
  unobserve = unobserve;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    ioCallback = callback;
    ioOptions = options;
  }
}

const SECTION_IDS = [
  "home-hero",
  "home-partners",
  "home-projects",
  "home-services",
  "home-contact",
] as const;

function mountSections() {
  document.body.innerHTML = SECTION_IDS.map(
    (id) => `<section id="${id}"></section>`,
  ).join("");
}

function byId(id: string): Element {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing test fixture element: #${id}`);
  }
  return element;
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

describe("useSectionSpy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ioCallback = null;
    ioOptions = undefined;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mountSections();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("observes matching section nodes and starts at index 0", () => {
    const { result } = renderHook(() => useSectionSpy(SECTION_IDS));

    expect(result.current).toBe(0);
    expect(observe).toHaveBeenCalledTimes(SECTION_IDS.length);
    expect(observe).toHaveBeenCalledWith(byId("home-hero"));
    expect(observe).toHaveBeenCalledWith(byId("home-contact"));
    expect(ioOptions?.threshold).toEqual([
      0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
    ]);
  });

  it("returns index 0 and skips observing when no ids match the DOM", () => {
    document.body.innerHTML = "<section id='other'></section>";

    const { result } = renderHook(() => useSectionSpy(SECTION_IDS));

    expect(result.current).toBe(0);
    expect(observe).not.toHaveBeenCalled();
  });

  it("picks the section with the highest intersection ratio", () => {
    const { result } = renderHook(() => useSectionSpy(SECTION_IDS));

    fireIntersection([
      { target: byId("home-hero"), intersectionRatio: 0.2 },
      { target: byId("home-partners"), intersectionRatio: 0.85 },
      { target: byId("home-projects"), intersectionRatio: 0.1 },
    ]);

    expect(result.current).toBe(1);

    fireIntersection([
      { target: byId("home-partners"), intersectionRatio: 0.05 },
      { target: byId("home-services"), intersectionRatio: 0.9 },
    ]);

    expect(result.current).toBe(3);
  });

  it("accepts a custom rootMargin", () => {
    renderHook(() =>
      useSectionSpy(SECTION_IDS, { rootMargin: "-10% 0px -10% 0px" }),
    );

    expect(ioOptions?.rootMargin).toBe("-10% 0px -10% 0px");
  });
});
