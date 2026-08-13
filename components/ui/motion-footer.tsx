"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { SameRouteLink } from "@/components/ui/SameRouteLink";
import {
  SocialPlatformIcon,
  SOCIAL_PLATFORM_LABELS,
  type SocialPlatformIconName,
} from "@/components/ui/social-platform-icons";
import { useGsapContext } from "@/hooks/useGsapContext";
import type { NavItem, NavSocialLink } from "@/lib/config/navigation";
import {
  ensureGsapPlugins,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import { SCROLL_SCRUB_SMOOTH } from "@/lib/motion/constants";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  DEFAULT_FOOTER_COPYRIGHT_SUFFIX,
  DEFAULT_FOOTER_CTA_HEADING,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_PREFIX,
  DEFAULT_FOOTER_MARQUEE_KEYWORDS,
  DEFAULT_FOOTER_SECONDARY_CTA_HREF,
  DEFAULT_FOOTER_SECONDARY_CTA_LABEL,
} from "@/lib/cms/fallbacks/site-settings";
import { cn } from "@/lib/utils";

/** Full-viewport footer travel needs softer lag than SCROLL_SCRUB_UI. */
const FOOTER_SCROLL_SCRUB = SCROLL_SCRUB_SMOOTH;

const currentYear = new Date().getFullYear();

export type CinematicFooterProps = {
  siteName: string;
  footerMotto: string;
  navItems: readonly NavItem[];
  socialLinks: readonly NavSocialLink[];
  contactCta: NavItem;
  footerMarqueeKeywords?: readonly string[];
  footerCtaHeading?: string;
  footerSecondaryCtaLabel?: string;
  footerSecondaryCtaHref?: string;
  footerCopyrightSuffix?: string;
  footerLocationPrefix?: string;
  footerLocation?: string;
};

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

function getSocialHref(link: NavSocialLink): string {
  if (link.platform === "email" && !link.href.startsWith("mailto:")) {
    return `mailto:${link.href.replace(/^mailto:/, "")}`;
  }

  return link.href;
}

function giantBrandLabel(siteName: string): string {
  const firstWord = siteName.trim().split(/\s+/)[0] ?? siteName;
  return firstWord.toUpperCase();
}

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useGsapContext(
      localRef,
      () => {
        const element = localRef.current;
        if (!element) {
          return;
        }

        const mm = gsap.matchMedia();

        mm.add(GSAP_ALLOW_MOTION, () => {
          const handleMouseMove = (event: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const halfWidth = rect.width / 2;
            const halfHeight = rect.height / 2;
            const x = event.clientX - rect.left - halfWidth;
            const y = event.clientY - rect.top - halfHeight;

            gsap.to(element, {
              x: x * 0.4,
              y: y * 0.4,
              rotationX: -y * 0.15,
              rotationY: x * 0.15,
              scale: 1.05,
              ease: "power2.out",
              duration: 0.4,
            });
          };

          const handleMouseLeave = () => {
            gsap.to(element, {
              x: 0,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              ease: "elastic.out(1, 0.3)",
              duration: 1.2,
            });
          };

          element.addEventListener("mousemove", handleMouseMove);
          element.addEventListener("mouseleave", handleMouseLeave);

          return () => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
          };
        });

        mm.add(GSAP_REDUCE_MOTION, () => {
          gsap.set(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
          });
        });
      },
      [],
    );

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

type MarqueeItemProps = {
  motto: string;
  keywords: readonly string[];
};

function MarqueeItem({ motto, keywords }: MarqueeItemProps) {
  return (
    <div className="flex items-center space-x-12 px-6">
      <span>{motto}</span>
      <span className="text-primary/60" aria-hidden="true">
        ✦
      </span>
      {keywords.map((keyword, index) => (
        <React.Fragment key={`${keyword}-${index}`}>
          <span>{keyword}</span>
          <span
            className={
              index % 2 === 0 ? "text-secondary/60" : "text-primary/60"
            }
            aria-hidden="true"
          >
            ✦
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function CinematicFooter({
  siteName,
  footerMotto,
  navItems,
  socialLinks,
  contactCta,
  footerMarqueeKeywords = DEFAULT_FOOTER_MARQUEE_KEYWORDS,
  footerCtaHeading = DEFAULT_FOOTER_CTA_HEADING,
  footerSecondaryCtaLabel = DEFAULT_FOOTER_SECONDARY_CTA_LABEL,
  footerSecondaryCtaHref = DEFAULT_FOOTER_SECONDARY_CTA_HREF,
  footerCopyrightSuffix = DEFAULT_FOOTER_COPYRIGHT_SUFFIX,
  footerLocationPrefix = DEFAULT_FOOTER_LOCATION_PREFIX,
  footerLocation = DEFAULT_FOOTER_LOCATION,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInteractive(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.2 },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useGsapContext(
    wrapperRef,
    () => {
      ensureGsapPlugins();

      const mm = gsap.matchMedia();

      mm.add(GSAP_ALLOW_MOTION, () => {
        gsap.fromTo(
          giantTextRef.current,
          { y: "10vh", scale: 0.8, opacity: 0 },
          {
            y: "0vh",
            scale: 1,
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 80%",
              end: "bottom bottom",
              scrub: FOOTER_SCROLL_SCRUB,
            },
          },
        );

        // Animate position only — keep interactive content opaque for focus visibility.
        gsap.fromTo(
          [headingRef.current, linksRef.current],
          { y: 50 },
          {
            y: 0,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 40%",
              end: "bottom bottom",
              scrub: FOOTER_SCROLL_SCRUB,
            },
          },
        );
      });

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set([giantTextRef.current, headingRef.current, linksRef.current], {
          y: 0,
          scale: 1,
          opacity: 1,
        });
      });
    },
    [],
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-screen w-full"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <footer
        className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground"
        inert={isInteractive ? undefined : true}
      >
        <div
          className="footer-aurora pointer-events-none absolute top-1/2 left-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]"
          aria-hidden="true"
        />
        <div
          className="footer-bg-grid pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        />

        <div
          ref={giantTextRef}
          className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          aria-hidden="true"
        >
          {giantBrandLabel(siteName)}
        </div>

        <div
          className="absolute top-12 left-0 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-[var(--shadow-lg)] backdrop-blur-md"
          aria-hidden="true"
        >
          <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase md:text-sm">
            <MarqueeItem motto={footerMotto} keywords={footerMarqueeKeywords} />
            <MarqueeItem motto={footerMotto} keywords={footerMarqueeKeywords} />
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
          <h2
            ref={headingRef}
            className="footer-text-glow mb-4 text-center font-display text-5xl font-black tracking-tighter md:text-8xl"
          >
            {footerCtaHeading}
          </h2>
          <p className="mb-12 max-w-md text-center text-sm text-muted-foreground md:text-base">
            {footerMotto}
          </p>

          <div
            ref={linksRef}
            className="flex w-full flex-col items-center gap-6"
          >
            <div className="flex w-full flex-wrap justify-center gap-6 md:gap-10">
              <MagneticButton
                as={SameRouteLink}
                href={contactCta.href}
                className="footer-text-link text-sm font-bold md:text-base"
              >
                {contactCta.label}
              </MagneticButton>

              <MagneticButton
                as={SameRouteLink}
                href={footerSecondaryCtaHref}
                className="footer-text-link text-sm font-bold md:text-base"
              >
                {footerSecondaryCtaLabel}
              </MagneticButton>
            </div>

            <nav aria-label="Footer" className="mt-2 w-full">
              <ul className="flex flex-wrap justify-center gap-3 md:gap-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <MagneticButton
                      as={SameRouteLink}
                      href={item.href}
                      className="footer-text-link text-xs font-medium md:text-sm"
                    >
                      {item.label}
                    </MagneticButton>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Connect">
              <ul className="flex flex-row flex-wrap items-center justify-center gap-1">
                {socialLinks.map((link) => {
                  const platform = link.platform as
                    | SocialPlatformIconName
                    | undefined;
                  const ariaLabel = platform
                    ? SOCIAL_PLATFORM_LABELS[platform]
                    : link.label;
                  const isEmail = platform === "email";

                  if (link.comingSoon) {
                    return (
                      <li key={link.label}>
                        <span
                          className="footer-social-icon cursor-default opacity-40"
                          aria-label={`${ariaLabel} (coming soon)`}
                          aria-disabled="true"
                          role="img"
                        >
                          {platform ? (
                            <SocialPlatformIcon platform={platform} size={20} />
                          ) : (
                            <span className="text-xs font-medium">
                              {link.label}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  }

                  if (platform) {
                    return (
                      <li key={link.label}>
                        <MagneticButton
                          as="a"
                          href={getSocialHref(link)}
                          className="footer-social-icon"
                          aria-label={ariaLabel}
                          rel={isEmail ? undefined : "noopener noreferrer"}
                          target={isEmail ? undefined : "_blank"}
                        >
                          <SocialPlatformIcon platform={platform} size={20} />
                        </MagneticButton>
                      </li>
                    );
                  }

                  return (
                    <li key={link.label}>
                      <MagneticButton
                        as="a"
                        href={getSocialHref(link)}
                        className="footer-text-link text-xs font-medium md:text-sm"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </MagneticButton>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
          <div className="order-2 space-y-1 text-center text-[10px] font-semibold tracking-widest text-muted-foreground uppercase md:order-1 md:text-left md:text-xs">
            <p>
              © {currentYear} {siteName}. {footerCopyrightSuffix}
            </p>
            <p>
              {footerLocationPrefix}
              {footerLocation}
            </p>
          </div>

          <MagneticButton
            as="button"
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground md:ml-auto"
          >
            <svg
              className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-y-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </MagneticButton>
        </div>
      </footer>
    </div>
  );
}
