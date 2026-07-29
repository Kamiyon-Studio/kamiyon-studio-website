import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TimelineEntryV2 } from "@/lib/timeline";

import { useCumulativeRoster } from "./useCumulativeRoster";

const observe = vi.fn();
const disconnect = vi.fn();
const unobserve = vi.fn();

let ioCallback: IntersectionObserverCallback | null = null;
let observerConstructed = 0;

class MockIntersectionObserver {
  observe = observe;
  disconnect = disconnect;
  unobserve = unobserve;

  constructor(callback: IntersectionObserverCallback) {
    ioCallback = callback;
    observerConstructed += 1;
  }
}

const alice = {
  id: "alice",
  name: "Alice",
  role: "Designer",
  photo: null,
};

const bob = {
  id: "bob",
  name: "Bob",
  role: "Engineer",
  photo: null,
};

const entries: TimelineEntryV2[] = [
  {
    key: "n1",
    entryType: "news",
    year: "2024",
    dateLabel: "2024",
    title: "News",
    body: "Body",
    images: [{ src: "/a.jpg", alt: "a" }],
  },
  {
    key: "j1",
    entryType: "teamJoin",
    year: "2024",
    dateLabel: "2024",
    title: "Alice joins",
    body: "Body",
    images: [{ src: "/a.jpg", alt: "a" }],
    rosterMember: alice,
  },
  {
    key: "j2",
    entryType: "teamJoin",
    year: "2025",
    dateLabel: "2025",
    title: "Bob joins",
    body: "Body",
    images: [{ src: "/b.jpg", alt: "b" }],
    rosterMember: bob,
  },
];

function mountRoot() {
  const root = document.createElement("div");
  root.innerHTML = `
    <article data-timeline-entry-key="n1" data-timeline-entry-type="news"></article>
    <article data-timeline-entry-key="j1" data-timeline-entry-type="teamJoin"></article>
    <article data-timeline-entry-key="j2" data-timeline-entry-type="teamJoin"></article>
  `;
  document.body.appendChild(root);
  return root;
}

function fire(
  items: Array<{
    target: Element;
    isIntersecting: boolean;
    top: number;
  }>,
) {
  act(() => {
    ioCallback?.(
      items.map(({ target, isIntersecting, top }) => ({
        target,
        isIntersecting,
        intersectionRatio: isIntersecting ? 0.5 : 0,
        boundingClientRect: {
          top,
          bottom: top + 100,
          left: 0,
          right: 100,
          width: 100,
          height: 100,
          x: 0,
          y: top,
          toJSON: () => ({}),
        } as DOMRectReadOnly,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: 0,
      })),
      {} as IntersectionObserver,
    );
  });
}

describe("useCumulativeRoster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ioCallback = null;
    observerConstructed = 0;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("innerHeight", 800);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("starts empty", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({ rootRef: { current: root }, entries }),
    );

    expect(result.current).toEqual([]);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it("adds members as joins pass, in timeline order", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({ rootRef: { current: root }, entries }),
    );

    const j1 = root.querySelector('[data-timeline-entry-key="j1"]')!;
    const j2 = root.querySelector('[data-timeline-entry-key="j2"]')!;

    fire([{ target: j1, isIntersecting: true, top: 100 }]);
    expect(result.current).toEqual([alice]);

    fire([{ target: j2, isIntersecting: true, top: 100 }]);
    expect(result.current).toEqual([alice, bob]);
  });

  it("removes later members when scrolling back up (reversible)", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({ rootRef: { current: root }, entries }),
    );

    const j1 = root.querySelector('[data-timeline-entry-key="j1"]')!;
    const j2 = root.querySelector('[data-timeline-entry-key="j2"]')!;

    fire([
      { target: j1, isIntersecting: true, top: 100 },
      { target: j2, isIntersecting: true, top: 100 },
    ]);
    expect(result.current).toEqual([alice, bob]);

    // Card leaves above the mid band → unwind
    fire([{ target: j2, isIntersecting: false, top: 500 }]);
    expect(result.current).toEqual([alice]);
  });

  it("unwinds when card top is exactly at the mid-band boundary", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({ rootRef: { current: root }, entries }),
    );

    const j1 = root.querySelector('[data-timeline-entry-key="j1"]')!;
    const j2 = root.querySelector('[data-timeline-entry-key="j2"]')!;

    fire([
      { target: j1, isIntersecting: true, top: 100 },
      { target: j2, isIntersecting: true, top: 100 },
    ]);
    expect(result.current).toEqual([alice, bob]);

    // innerHeight stub is 800 → bandMid 400; inclusive boundary must unwind
    fire([{ target: j2, isIntersecting: false, top: 400 }]);
    expect(result.current).toEqual([alice]);
  });

  it("keeps members when monotonic is true", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({
        rootRef: { current: root },
        entries,
        monotonic: true,
      }),
    );

    const j2 = root.querySelector('[data-timeline-entry-key="j2"]')!;
    fire([{ target: j2, isIntersecting: true, top: 100 }]);
    expect(result.current).toEqual([bob]);

    fire([{ target: j2, isIntersecting: false, top: 500 }]);
    expect(result.current).toEqual([bob]);
  });

  it("revealAll returns the full roster without constructing an observer", () => {
    const root = mountRoot();
    const { result } = renderHook(() =>
      useCumulativeRoster({
        rootRef: { current: root },
        entries,
        revealAll: true,
      }),
    );

    expect(result.current).toEqual([alice, bob]);
    expect(observerConstructed).toBe(0);
    expect(observe).not.toHaveBeenCalled();
  });
});
