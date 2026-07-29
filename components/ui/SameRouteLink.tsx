"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type MouseEvent, type ReactNode } from "react";

import {
  handleSameRouteNavClick,
  isExternalHref,
} from "@/lib/navigation/same-route-scroll";

type SameRouteLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "data-menu-fade"?: string;
  /** Called after click handling (e.g. close overlay menu). */
  onNavigate?: () => void;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function isMailOrTel(href: string): boolean {
  return /^(mailto:|tel:)/i.test(href.trim());
}

export const SameRouteLink = forwardRef<HTMLAnchorElement, SameRouteLinkProps>(
  function SameRouteLink(
    {
      href,
      children,
      className,
      tabIndex,
      onClick,
      onNavigate,
      "aria-label": ariaLabel,
      "data-menu-fade": dataMenuFade,
    },
    ref,
  ) {
    const pathname = usePathname() ?? "/";

    if (isExternalHref(href)) {
      const openInNewTab = !isMailOrTel(href);

      return (
        <a
          ref={ref}
          href={href}
          className={className}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          data-menu-fade={dataMenuFade}
          {...(openInNewTab
            ? { target: "_blank" as const, rel: "noopener noreferrer" }
            : {})}
          onClick={(event) => {
            onClick?.(event);
            onNavigate?.();
          }}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        data-menu-fade={dataMenuFade}
        onClick={(event) => {
          handleSameRouteNavClick(event, href, pathname);
          onClick?.(event);
          onNavigate?.();
        }}
      >
        {children}
      </Link>
    );
  },
);
