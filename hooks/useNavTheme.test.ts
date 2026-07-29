import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNavTheme, type NavTheme } from "./useNavTheme";

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

function mountThemeSections() {
  document.body.innerHTML = `
    <section id="home-hero" data-nav-theme="dark"></section>
    <section id="home-partners" data-nav-theme="light"></section>
    <div id="services-card" class="scroll-stack-card" data-nav-theme="dark"></div>
  `;
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

function byId(id: string): Element {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing test fixture element: #${id}`);
  }
  return element;
}

describe("useNavTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ioCallback = null;
    ioOptions = undefined;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mountThemeSections();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("observes every themed band and starts on dark", () => {
    const { result } = renderHook(() => useNavTheme());

    expect(result.current).toBe("dark");
    expect(observe).toHaveBeenCalledTimes(3);
    expect(observe).toHaveBeenCalledWith(byId("home-hero"));
    expect(observe).toHaveBeenCalledWith(byId("home-partners"));
    expect(observe).toHaveBeenCalledWith(byId("services-card"));
  });

  it("stays on dark when the page has no themed bands", () => {
    document.body.innerHTML = "<section id='untagged'></section>";

    const { result } = renderHook(() => useNavTheme());

    expect(result.current).toBe("dark");
    expect(observe).not.toHaveBeenCalled();
  });

  it("applies the default header-band rootMargin", () => {
    renderHook(() => useNavTheme());

    expect(ioOptions?.rootMargin).toBe("-72px 0px 0px 0px");
  });

  it("applies a caller-supplied rootMargin", () => {
    renderHook(() => useNavTheme({ rootMargin: "-120px 0px 0px 0px" }));

    expect(ioOptions?.rootMargin).toBe("-120px 0px 0px 0px");
  });

  it("selects the theme of the band with the highest intersection ratio", () => {
    const { result } = renderHook(() => useNavTheme());

    fireIntersection([
      { target: byId("home-hero"), intersectionRatio: 0.1 },
      { target: byId("services-card"), intersectionRatio: 0.9 },
    ]);

    expect(result.current).toBe("dark");

    fireIntersection([
      { target: byId("home-partners"), intersectionRatio: 0.95 },
    ]);

    expect(result.current).toBe("light");
  });

  it("falls back to dark when no band intersects the header", () => {
    const { result } = renderHook(() => useNavTheme());

    fireIntersection([{ target: byId("services-card"), intersectionRatio: 1 }]);
    expect(result.current).toBe("dark");

    fireIntersection([
      { target: byId("home-hero"), intersectionRatio: 0 },
      { target: byId("home-partners"), intersectionRatio: 0 },
      { target: byId("services-card"), intersectionRatio: 0 },
    ]);

    expect(result.current).toBe("dark");
  });

  it("forcedTheme overrides the observed theme and skips observation", () => {
    const { result } = renderHook(() => useNavTheme({ forcedTheme: "dark" }));

    expect(result.current).toBe("dark");
    expect(observe).not.toHaveBeenCalled();
  });

  it("resumes observing once forcedTheme is cleared", () => {
    const { result, rerender } = renderHook(
      (props: { forcedTheme: NavTheme | null }) => useNavTheme(props),
      { initialProps: { forcedTheme: "dark" as NavTheme | null } },
    );

    expect(observe).not.toHaveBeenCalled();

    rerender({ forcedTheme: null });

    expect(observe).toHaveBeenCalledTimes(3);

    fireIntersection([
      { target: byId("home-partners"), intersectionRatio: 0.8 },
    ]);

    expect(result.current).toBe("light");
  });

  it("ignores data-nav-theme on the nav root itself", () => {
    document.body.innerHTML = `
      <div class="sterling-gate" data-nav-theme="dark"></div>
      <section id="home-partners" data-nav-theme="light"></section>
    `;

    const { result } = renderHook(() => useNavTheme());

    fireIntersection([
      { target: byId("home-partners"), intersectionRatio: 0.5 },
    ]);

    expect(result.current).toBe("light");
    expect(observe).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(byId("home-partners"));
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderHook(() => useNavTheme());

    expect(disconnect).not.toHaveBeenCalled();

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
