"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  ensureGsapPlugins,
  refreshScrollTrigger,
  ScrollTrigger,
} from "@/lib/gsap";
import { revealScrollTriggeredAncestors } from "@/lib/motion/hash-reveal";

type GsapScrollProviderProps = {
  children: ReactNode;
};

/** Single delayed refresh for late-loading images after route change. */
const LATE_IMAGE_REFRESH_MS = 400;

function focusHashTarget(hash: string): void {
  if (!hash || hash === "#") {
    return;
  }

  const el = document.querySelector(hash);
  if (!(el instanceof HTMLElement)) {
    return;
  }

  revealScrollTriggeredAncestors(el);

  if (!el.hasAttribute("tabindex")) {
    el.tabIndex = -1;
  }

  el.focus({ preventScroll: true });
}

let pendingAnchorHash: string | null = null;

function rememberAnchorHash(event: MouseEvent): void {
  const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href || href === "#") {
    return;
  }

  pendingAnchorHash = href;
}

function NativeHashFocus() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      rememberAnchorHash(event);
      const href = pendingAnchorHash;
      if (!href) {
        return;
      }

      requestAnimationFrame(() => {
        focusHashTarget(href);
        pendingAnchorHash = null;
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

/**
 * Native document scroll + ScrollTrigger sync (no Lenis).
 * Keeps hash-link focus behavior for skip links and in-page anchors.
 * Refreshes ScrollTrigger on App Router pathname changes (never mass-kills).
 */
export function GsapScrollProvider({ children }: GsapScrollProviderProps) {
  const pathname = usePathname();
  /** null until first effect — skips initial mount refresh (fonts/load handle it). */
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    const onScroll = () => {
      ScrollTrigger.update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const onLoad = () => {
      refreshScrollTrigger();
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(onLoad);
    }

    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current === pathname) {
      return;
    }

    // Sync before rAF so A→B→A (cancelled frames) still schedules a refresh.
    prevPathnameRef.current = pathname;

    let cancelled = false;
    let lateTimer: ReturnType<typeof setTimeout> | undefined;

    const rafId = requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }
      refreshScrollTrigger();
      // One delayed refresh for late images; cancelled on rapid route changes.
      lateTimer = setTimeout(() => {
        if (!cancelled) {
          refreshScrollTrigger();
        }
      }, LATE_IMAGE_REFRESH_MS);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (lateTimer !== undefined) {
        clearTimeout(lateTimer);
      }
    };
  }, [pathname]);

  return (
    <>
      <NativeHashFocus />
      {children}
    </>
  );
}
