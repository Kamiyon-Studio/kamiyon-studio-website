"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { CustomEase } from "gsap/CustomEase";

import { SameRouteLink } from "@/components/ui/SameRouteLink";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import "./sterling-gate-kinetic-navigation.css";

export type SterlingGateNavItem = {
  label: string;
  href: string;
};

export type SterlingGateKineticNavigationProps = {
  navItems: readonly SterlingGateNavItem[];
  contactCta?: SterlingGateNavItem;
  siteName: string;
  logoSrc?: string;
};

type CleanupItem = Element & { _sgCleanup?: () => void };

let customEaseReady = false;

function ensureCustomEase(): void {
  if (typeof window === "undefined" || customEaseReady) {
    return;
  }

  try {
    gsap.registerPlugin(CustomEase);
    if (!gsap.parseEase("main")) {
      CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
    }
    gsap.defaults({ ease: "main", duration: 0.7 });
    customEaseReady = true;
  } catch {
    gsap.defaults({ ease: "power2.out", duration: 0.7 });
    customEaseReady = true;
  }
}

function AmbientShapes() {
  return (
    <div className="ambient-background-shapes" aria-hidden="true">
      <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
        <circle className="shape-element" cx="80" cy="120" r="40" fill="rgba(255,121,152,0.18)" />
        <circle className="shape-element" cx="300" cy="80" r="60" fill="rgba(233,192,128,0.16)" />
        <circle className="shape-element" cx="200" cy="300" r="80" fill="rgba(255,121,152,0.12)" />
        <circle className="shape-element" cx="350" cy="280" r="30" fill="rgba(233,192,128,0.18)" />
      </svg>
      <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
        <path
          className="shape-element"
          d="M0 200 Q100 100, 200 200 T 400 200"
          stroke="rgba(255,121,152,0.22)"
          strokeWidth="60"
          fill="none"
        />
        <path
          className="shape-element"
          d="M0 280 Q100 180, 200 280 T 400 280"
          stroke="rgba(233,192,128,0.18)"
          strokeWidth="40"
          fill="none"
        />
      </svg>
      <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
        <circle className="shape-element" cx="50" cy="50" r="8" fill="rgba(255,121,152,0.3)" />
        <circle className="shape-element" cx="150" cy="50" r="8" fill="rgba(233,192,128,0.3)" />
        <circle className="shape-element" cx="250" cy="50" r="8" fill="rgba(255,121,152,0.28)" />
        <circle className="shape-element" cx="350" cy="50" r="8" fill="rgba(233,192,128,0.28)" />
        <circle className="shape-element" cx="100" cy="150" r="12" fill="rgba(255,121,152,0.25)" />
        <circle className="shape-element" cx="200" cy="150" r="12" fill="rgba(233,192,128,0.25)" />
        <circle className="shape-element" cx="300" cy="150" r="12" fill="rgba(255,121,152,0.25)" />
        <circle className="shape-element" cx="50" cy="250" r="10" fill="rgba(233,192,128,0.3)" />
        <circle className="shape-element" cx="150" cy="250" r="10" fill="rgba(255,121,152,0.3)" />
        <circle className="shape-element" cx="250" cy="250" r="10" fill="rgba(233,192,128,0.3)" />
        <circle className="shape-element" cx="350" cy="250" r="10" fill="rgba(255,121,152,0.3)" />
      </svg>
      <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
        <path
          className="shape-element"
          d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
          fill="rgba(255,121,152,0.14)"
        />
        <path
          className="shape-element"
          d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
          fill="rgba(233,192,128,0.12)"
        />
      </svg>
      <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
        <line
          className="shape-element"
          x1="0"
          y1="100"
          x2="300"
          y2="400"
          stroke="rgba(255,121,152,0.16)"
          strokeWidth="30"
        />
        <line
          className="shape-element"
          x1="100"
          y1="0"
          x2="400"
          y2="300"
          stroke="rgba(233,192,128,0.14)"
          strokeWidth="25"
        />
        <line
          className="shape-element"
          x1="200"
          y1="0"
          x2="400"
          y2="200"
          stroke="rgba(255,121,152,0.12)"
          strokeWidth="20"
        />
      </svg>
    </div>
  );
}

export function SterlingGateKineticNavigation({
  navItems,
  contactCta,
  siteName,
  logoSrc = "/logo.svg",
}: SterlingGateKineticNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!containerRef.current || reduceMotion) {
      return;
    }

    ensureCustomEase();
    const root = containerRef.current;

    const ctx = gsap.context(() => {
      const menuItems = root.querySelectorAll(".menu-list-item[data-shape]");
      const shapesContainer = root.querySelector(".ambient-background-shapes");

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape = shapesContainer?.querySelector(`.bg-shape-${shapeIndex}`);
        if (!shape) {
          return;
        }

        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          shapesContainer?.querySelectorAll(".bg-shape").forEach((node) => {
            node.classList.remove("active");
          });
          shape.classList.add("active");
          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, y: -10 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "back.out(1.7)",
              overwrite: "auto",
            },
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);
        (item as CleanupItem)._sgCleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
        };
      });
    }, containerRef);

    return () => {
      ctx.revert();
      root.querySelectorAll(".menu-list-item[data-shape]").forEach((item) => {
        (item as CleanupItem)._sgCleanup?.();
      });
    };
  }, [reduceMotion, navItems]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const root = containerRef.current;
    const navWrap = root.querySelector<HTMLElement>(".nav-overlay-wrapper");
    const menu = root.querySelector<HTMLElement>(".menu-content");
    const overlay = root.querySelector<HTMLElement>(".overlay");
    const bgPanels = root.querySelectorAll(".backdrop-layer");
    const menuLinks = root.querySelectorAll(".nav-link");
    const fadeTargets = root.querySelectorAll("[data-menu-fade]");
    const menuButton = root.querySelector(".nav-close-btn");
    const menuButtonTexts = menuButton?.querySelectorAll("p");
    const menuButtonIcon = menuButton?.querySelector(".menu-button-icon");

    if (!navWrap || !menu || !overlay) {
      return;
    }

    if (reduceMotion) {
      if (isMenuOpen) {
        navWrap.style.display = "block";
        navWrap.setAttribute("data-nav", "open");
        gsap.set([overlay, menu, bgPanels, menuLinks, fadeTargets], {
          clearProps: "all",
          autoAlpha: 1,
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
        });
      } else {
        navWrap.setAttribute("data-nav", "closed");
        navWrap.style.display = "none";
      }
      return;
    }

    ensureCustomEase();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (isMenuOpen) {
        navWrap.setAttribute("data-nav", "open");
        tl.set(navWrap, { display: "block" }).set(menu, { xPercent: 0 }, "<");
        if (menuButtonTexts && menuButtonTexts.length > 0) {
          tl.fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 });
        }
        if (menuButtonIcon) {
          tl.fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<");
        }
        tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
          .fromTo(
            bgPanels,
            { xPercent: 101 },
            { xPercent: 0, stagger: 0.12, duration: 0.575 },
            "<",
          )
          .fromTo(
            menuLinks,
            { yPercent: 140, rotate: 10 },
            { yPercent: 0, rotate: 0, stagger: 0.05 },
            "<+=0.35",
          );

        if (fadeTargets.length) {
          tl.fromTo(
            fadeTargets,
            { autoAlpha: 0, yPercent: 50 },
            { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "all" },
            "<+=0.2",
          );
        }
      } else {
        navWrap.setAttribute("data-nav", "closed");
        tl.to(overlay, { autoAlpha: 0 }).to(menu, { xPercent: 120 }, "<");
        if (menuButtonTexts && menuButtonTexts.length > 0) {
          tl.to(menuButtonTexts, { yPercent: 0 }, "<");
        }
        if (menuButtonIcon) {
          tl.to(menuButtonIcon, { rotate: 0 }, "<");
        }
        tl.set(navWrap, { display: "none" });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMenuOpen, reduceMotion]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="sterling-gate" ref={containerRef}>
      <div className="site-header-wrapper">
        <header className="header">
          <div className="container is--full">
            <nav className="nav-row" aria-label="Primary">
              <SameRouteLink
                href="/"
                className="nav-logo-row"
                aria-label={`${siteName} — Home`}
                onNavigate={closeMenu}
              >
                <Image
                  src={logoSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="nav-logo-mark"
                  priority
                />
                <span>{siteName}</span>
              </SameRouteLink>
              <div className="nav-row__right">
                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-controls={menuId}
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  <div className="menu-button-text">
                    <p className="p-large">Menu</p>
                    <p className="p-large">Close</p>
                  </div>
                  <div className="icon-wrap" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="menu-button-icon"
                    >
                      <path
                        d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <section className="fullscreen-menu-container" aria-hidden={!isMenuOpen}>
        <div data-nav="closed" className="nav-overlay-wrapper" id={menuId}>
          <div className="overlay" onClick={closeMenu} />
          <nav className="menu-content" aria-label="Site sections">
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />
              <AmbientShapes />
            </div>

            <div className="menu-content-wrapper">
              <ul className="menu-list">
                {navItems.map((item, index) => (
                  <li
                    key={`${item.href}-${item.label}`}
                    className="menu-list-item"
                    data-shape={String((index % 5) + 1)}
                  >
                    <SameRouteLink
                      href={item.href}
                      className="nav-link w-inline-block"
                      onNavigate={closeMenu}
                    >
                      <p className="nav-link-text" data-menu-fade={index > 2 ? "" : undefined}>
                        {item.label}
                      </p>
                      <div className="nav-link-hover-bg" aria-hidden="true" />
                    </SameRouteLink>
                  </li>
                ))}
              </ul>
              {contactCta ? (
                <SameRouteLink
                  href={contactCta.href}
                  className="menu-cta"
                  data-menu-fade=""
                  onNavigate={closeMenu}
                >
                  {contactCta.label}
                </SameRouteLink>
              ) : null}
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}
