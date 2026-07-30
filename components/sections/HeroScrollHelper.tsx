"use client";

import { useCallback, useRef, type PointerEventHandler } from "react";

import { useHeroScrollBounce } from "@/hooks/useHeroScrollBounce";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroScrollHelper() {
  const { visible, dismiss } = useHeroScrollBounce({
    threshold: 24,
    maxBounces: 1,
  });
  const reduceMotion = useReducedMotion();
  const dismissOnceRef = useRef(false);

  const dismissOnce = useCallback(() => {
    if (dismissOnceRef.current) {
      return;
    }
    dismissOnceRef.current = true;
    dismiss();
  }, [dismiss]);

  const handleDismissPointerDown: PointerEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    dismissOnce();
  };

  if (!visible) {
    return null;
  }

  const enterClass = reduceMotion
    ? ""
    : "animate-[hero-scroll-helper-in_0.3s_ease-out_both]";
  const bounceClass = reduceMotion
    ? ""
    : "animate-bounce hover:animate-none focus-within:animate-none";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 ${enterClass}`}
    >
      <div
        className={`pointer-events-auto relative rounded-2xl bg-[var(--color-sakura)] px-4 py-2 font-sans text-[var(--text-on-accent)] shadow-sm ${bounceClass}`}
      >
        <span
          className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-[var(--color-sakura)]"
          aria-hidden="true"
        />
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Scroll down</p>
          <button
            type="button"
            onPointerDown={handleDismissPointerDown}
            onClick={dismissOnce}
            aria-label="Dismiss scroll tip"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-lg leading-none transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-on-accent)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
