"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import type { CardNavItem } from "@/lib/config/card-nav";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import "./CardNav.css";

export type CardNavProps = {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Collapsed bar is see-through; expands to solid surface. */
  transparent?: boolean;
};

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest('[aria-hidden="true"]')) return false;
    return true;
  });
}

/**
 * React Bits CardNav — expandable card menu with GSAP height + stagger.
 * Closed chrome: logo left + 2-bar burger right. Open: top-right vertical stack.
 */
export function CardNav({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "var(--bg-surface)",
  menuColor = "var(--color-ivory)",
  buttonBgColor = "var(--color-charcoal)",
  buttonTextColor = "var(--color-ivory)",
  ctaLabel = "Get in touch",
  ctaHref = "/contact",
  transparent = false,
}: CardNavProps) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  /** Collapsed chrome is invisible — logo + burger only; panel surface appears when open. */
  const topBarHeight = 96;
  const resolvedBaseColor = isExpanded ? baseColor : "transparent";
  const resolvedMenuColor =
    transparent && !isExpanded ? "var(--color-ivory)" : menuColor;
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
    if (!contentEl) return 260;

    const wasVisible = contentEl.style.visibility;
    const wasPointerEvents = contentEl.style.pointerEvents;
    const wasPosition = contentEl.style.position;
    const wasHeight = contentEl.style.height;

    contentEl.style.visibility = "visible";
    contentEl.style.pointerEvents = "auto";
    contentEl.style.position = "static";
    contentEl.style.height = "auto";

    contentEl.offsetHeight;

    const padding = 16;
    const contentHeight = contentEl.scrollHeight;

    contentEl.style.visibility = wasVisible;
    contentEl.style.pointerEvents = wasPointerEvents;
    contentEl.style.position = wasPosition;
    contentEl.style.height = wasHeight;

    return topBarHeight + contentHeight + padding;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const cards = cardsRef.current.filter(Boolean);
    const duration = prefersReducedMotion() ? 0 : 0.4;

    gsap.set(navEl, { height: topBarHeight, overflow: "hidden" });
    gsap.set(cards, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration,
      ease,
    });

    tl.to(
      cards,
      {
        y: 0,
        opacity: 1,
        duration,
        ease,
        stagger: prefersReducedMotion() ? 0 : 0.08,
      },
      "-=0.1",
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // Recreate when ease/items change — intentional; helpers close over latest values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        const tl = tlRef.current;
        if (!tl) return;
        setIsHamburgerOpen(false);
        tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
        tl.reverse();
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const navEl = navRef.current;
    if (!navEl) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(navEl);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !navEl.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !navEl.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const handleHamburgerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[i] = el;
  };

  const visibleItems = (items || []).slice(0, 3);
  const containerClass = [
    "card-nav-container",
    isExpanded ? "card-nav-container--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""} ${transparent ? "card-nav--transparent" : ""}`.trim()}
        style={{ backgroundColor: resolvedBaseColor }}
        aria-label="Primary"
      >
        <div
          className={`card-nav-top ${isExpanded ? "" : "card-nav-top--closed"}`.trim()}
        >
          <button
            ref={toggleRef}
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            onKeyDown={handleHamburgerKeyDown}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            aria-expanded={isExpanded}
            style={{ color: resolvedMenuColor }}
          >
            <div className="hamburger-line hamburger-line--long" />
            <div className="hamburger-line hamburger-line--short" />
          </button>

          <div className="logo-container">
            <Link
              href="/"
              className="card-nav-logo-link"
              aria-label={`${logoAlt} — Home`}
            >
              {/* Decorative mark; accessible name is on the link */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" className="card-nav-logo" />
            </Link>
          </div>

          <Link
            href={ctaHref}
            className="card-nav-cta-button"
            tabIndex={isExpanded ? undefined : -1}
            aria-hidden={!isExpanded}
            style={
              {
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              } as CSSProperties
            }
          >
            {ctaLabel}
          </Link>
        </div>

        <div
          className="card-nav-content card-nav-content--stack"
          aria-hidden={!isExpanded}
        >
          {visibleItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{
                backgroundColor: item.bgColor,
                color: item.textColor,
              }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) =>
                  isExternalHref(lnk.href) ? (
                    <a
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      tabIndex={isExpanded ? undefined : -1}
                      {...(lnk.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="nav-card-link-icon"
                        style={{ width: 14, height: 14 }}
                        aria-hidden
                      />
                      {lnk.label}
                    </a>
                  ) : (
                    <Link
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      tabIndex={isExpanded ? undefined : -1}
                    >
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="nav-card-link-icon"
                        style={{ width: 14, height: 14 }}
                        aria-hidden
                      />
                      {lnk.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
