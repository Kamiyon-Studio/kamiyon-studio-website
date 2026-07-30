"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { cn } from "@/lib/utils";

export type LogoMarqueeItem = {
  id: string;
  src?: string | null;
  alt: string;
  /** Fallback text when src is missing or disallowed. */
  label: string;
};

export type LogoMarqueeProps = {
  logos: LogoMarqueeItem[];
  /** Loop duration in seconds. Default 40. */
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  /** Tailwind height/width classes for the logo image. */
  logoImageClassName?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function LogoCell({
  logo,
  logoImageClassName,
  interactive = true,
}: {
  logo: LogoMarqueeItem;
  logoImageClassName?: string;
  interactive?: boolean;
}) {
  const rawSrc = logo.src?.trim() || "";
  const logoUrl =
    rawSrc && isAllowedNextImageSrc(rawSrc) ? rawSrc : null;

  return (
    <div
      className="group/logo flex shrink-0 items-center justify-center px-5 py-2 md:px-6 lg:px-8"
      tabIndex={interactive && logoUrl ? 0 : undefined}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={logo.alt}
          width={120}
          height={36}
          className={cn(
            "w-auto max-w-[6rem] object-contain opacity-70 grayscale transition-[filter,opacity] duration-300",
            "group-hover/logo:opacity-100 group-hover/logo:grayscale-0",
            "group-focus-within/logo:opacity-100 group-focus-within/logo:grayscale-0",
            logoImageClassName ?? "h-8 md:h-9",
          )}
        />
      ) : (
        <span className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase opacity-70 transition-opacity duration-300 group-hover/logo:opacity-100 md:text-sm">
          {logo.label}
        </span>
      )}

    </div>
  );
}

function LogoRow({
  logos,
  logoImageClassName,
  interactive = true,
}: {
  logos: LogoMarqueeItem[];
  logoImageClassName?: string;
  interactive?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center">
      {logos.map((logo) => (
        <LogoCell
          key={logo.id}
          logo={logo}
          logoImageClassName={logoImageClassName}
          interactive={interactive}
        />
      ))}
    </div>
  );
}

export function LogoMarquee({
  logos,
  speed = 40,
  pauseOnHover = false,
  className,
  logoImageClassName,
}: LogoMarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (logos.length === 0) {
    return null;
  }

  const edgeFadeClassName =
    "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]";

  if (prefersReducedMotion) {
    return (
      <div
        data-testid="logo-marquee"
        className={cn(
          "flex flex-wrap items-center justify-center",
          edgeFadeClassName,
          className,
        )}
      >
        <LogoRow logos={logos} logoImageClassName={logoImageClassName} />
      </div>
    );
  }

  const trackClassName = cn(
    "flex w-max animate-marquee-horizontal motion-reduce:animate-none",
    pauseOnHover && "group-hover/track:[animation-play-state:paused]",
  );

  return (
    <div
      data-testid="logo-marquee"
      className={cn(
        "overflow-hidden",
        edgeFadeClassName,
        pauseOnHover && "group/track",
        className,
      )}
      style={
        {
          "--duration": `${speed}s`,
        } as CSSProperties
      }
    >
      <div className={trackClassName}>
        <LogoRow logos={logos} logoImageClassName={logoImageClassName} />
        <div aria-hidden="true">
          <LogoRow
            logos={logos.map((logo) => ({
              ...logo,
              id: `${logo.id}-clone`,
            }))}
            logoImageClassName={logoImageClassName}
            interactive={false}
          />
        </div>
      </div>
    </div>
  );
}
