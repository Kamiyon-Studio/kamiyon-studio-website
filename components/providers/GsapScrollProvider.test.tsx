import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { usePathnameMock, refreshScrollTriggerMock, scrollTriggerUpdateMock } =
  vi.hoisted(() => ({
    usePathnameMock: vi.fn(() => "/"),
    refreshScrollTriggerMock: vi.fn(),
    scrollTriggerUpdateMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/lib/gsap", () => ({
  ensureGsapPlugins: vi.fn(),
  refreshScrollTrigger: refreshScrollTriggerMock,
  ScrollTrigger: {
    update: scrollTriggerUpdateMock,
    refresh: vi.fn(),
    getAll: vi.fn(() => []),
    kill: vi.fn(),
  },
}));

vi.mock("@/lib/motion/hash-reveal", () => ({
  revealScrollTriggeredAncestors: vi.fn(),
}));

import { GsapScrollProvider } from "./GsapScrollProvider";

const PROVIDER_SOURCE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "GsapScrollProvider.tsx"),
  "utf8",
);

describe("GsapScrollProvider", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/");
    refreshScrollTriggerMock.mockClear();
    scrollTriggerUpdateMock.mockClear();
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("mounts children", () => {
    render(
      <GsapScrollProvider>
        <p>Scroll child</p>
      </GsapScrollProvider>,
    );

    expect(screen.getByText("Scroll child")).toBeInTheDocument();
  });

  it("registers a passive scroll listener that updates ScrollTrigger", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    render(
      <GsapScrollProvider>
        <span>child</span>
      </GsapScrollProvider>,
    );

    const scrollCall = addSpy.mock.calls.find(
      ([type]) => type === "scroll",
    );
    expect(scrollCall).toBeDefined();
    expect(scrollCall?.[2]).toEqual({ passive: true });

    window.dispatchEvent(new Event("scroll"));
    expect(scrollTriggerUpdateMock).toHaveBeenCalled();

    addSpy.mockRestore();
  });

  it("refreshes ScrollTrigger on pathname change via rAF (never mass-kills)", async () => {
    const { rerender } = render(
      <GsapScrollProvider>
        <span>route-a</span>
      </GsapScrollProvider>,
    );

    refreshScrollTriggerMock.mockClear();
    usePathnameMock.mockReturnValue("/about");

    rerender(
      <GsapScrollProvider>
        <span>route-b</span>
      </GsapScrollProvider>,
    );

    expect(refreshScrollTriggerMock).toHaveBeenCalled();
    expect(PROVIDER_SOURCE).not.toMatch(
      /ScrollTrigger\.(killAll|getAll\(\)\.forEach)/,
    );
    expect(PROVIDER_SOURCE).not.toMatch(/\.kill\(/);
  });

  it("still refreshes after rapid pathname bounce A→B→A before rAF", () => {
    const pending: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        pending.push(cb);
        return pending.length;
      }),
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id: number) => {
        pending[id - 1] = () => undefined;
      }),
    );

    const { rerender } = render(
      <GsapScrollProvider>
        <span>home</span>
      </GsapScrollProvider>,
    );

    refreshScrollTriggerMock.mockClear();
    usePathnameMock.mockReturnValue("/about");
    rerender(
      <GsapScrollProvider>
        <span>about</span>
      </GsapScrollProvider>,
    );

    usePathnameMock.mockReturnValue("/");
    rerender(
      <GsapScrollProvider>
        <span>home-again</span>
      </GsapScrollProvider>,
    );

    for (const cb of pending) {
      cb(0);
    }

    expect(refreshScrollTriggerMock).toHaveBeenCalled();
  });

  it("removes scroll and load listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <GsapScrollProvider>
        <span>child</span>
      </GsapScrollProvider>,
    );

    unmount();

    const removedTypes = removeSpy.mock.calls.map(([type]) => type);
    expect(removedTypes).toContain("scroll");
    expect(removedTypes).toContain("load");

    removeSpy.mockRestore();
  });

  it("does not import Lenis, ScrollSmoother, or Framer as scroll engine", () => {
    expect(PROVIDER_SOURCE).not.toMatch(
      /import\s+.*\b(?:lenis|@studio-freight\/lenis|lenis\/react)\b/i,
    );
    expect(PROVIDER_SOURCE).not.toMatch(/from\s+["'][^"']*lenis[^"']*["']/i);
    expect(PROVIDER_SOURCE).not.toMatch(/ScrollSmoother/);
    expect(PROVIDER_SOURCE).not.toMatch(
      /from\s+["'](?:framer-motion|motion\/react)["']/,
    );
  });

  it("preserves hash-focus via NativeHashFocus + revealScrollTriggeredAncestors", () => {
    expect(PROVIDER_SOURCE).toContain("revealScrollTriggeredAncestors");
    expect(PROVIDER_SOURCE).toContain("NativeHashFocus");
    expect(PROVIDER_SOURCE).toContain('a[href^="#"]');
  });
});
