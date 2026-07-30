import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useReducedMotion } from "./useReducedMotion";

type Listener = () => void;

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();

  const mediaQuery = {
    matches,
    addEventListener: (_event: string, listener: Listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: Listener) => {
      listeners.delete(listener);
    },
  };

  vi.spyOn(window, "matchMedia").mockReturnValue(
    mediaQuery as unknown as MediaQueryList,
  );

  return {
    listeners,
    /** Simulate the OS preference flipping while mounted. */
    change(next: boolean) {
      mediaQuery.matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useReducedMotion", () => {
  it("reports the current preference once mounted", () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it("reports false when motion is allowed", () => {
    stubMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("re-renders when the preference changes while mounted", () => {
    const media = stubMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      media.change(true);
    });

    expect(result.current).toBe(true);
  });

  it("unsubscribes from the media query on unmount", () => {
    const media = stubMatchMedia(true);

    const { unmount } = renderHook(() => useReducedMotion());
    expect(media.listeners.size).toBe(1);

    unmount();

    expect(media.listeners.size).toBe(0);
  });
});
