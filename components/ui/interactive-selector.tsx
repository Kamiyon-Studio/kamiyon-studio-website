"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  SOCIAL_PLATFORM_LABELS,
  SocialPlatformIcon,
  type SocialPlatformIconName,
} from "@/components/ui/social-platform-icons";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { SocialLink, TeamMember } from "@/lib/cms/types";
import { getInitials } from "@/lib/team/initials";
import { cn } from "@/lib/utils";

export type InteractiveSelectorProps = {
  members: TeamMember[];
  className?: string;
  /** Index of the strip expanded on mount. Defaults to 0. */
  defaultActiveIndex?: number;
};

/**
 * Accordion-style portrait strip (interactive selector): collapsed columns stay
 * desaturated; the active/hovered column expands to full color and reveals
 * name, role, and socials.
 */
export function InteractiveSelector({
  members,
  className,
  defaultActiveIndex = 0,
}: InteractiveSelectorProps) {
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const safeDefault =
    members.length === 0
      ? null
      : Math.min(Math.max(defaultActiveIndex, 0), members.length - 1);
  const [activeIndex, setActiveIndex] = useState<number | null>(safeDefault);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const activate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const focusTab = useCallback((index: number) => {
    const tab = tablistRef.current?.querySelector<HTMLElement>(
      `[data-team-tab="${index}"]`,
    );
    tab?.focus();
  }, []);

  const goToRelative = useCallback(
    (delta: number) => {
      if (members.length === 0 || activeIndex === null) {
        return;
      }
      const next = (activeIndex + delta + members.length) % members.length;
      activate(next);
      focusTab(next);
    },
    [activate, activeIndex, focusTab, members.length],
  );

  const onTablistKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (members.length === 0 || activeIndex === null) {
        return;
      }

      let next: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = (activeIndex + 1) % members.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = (activeIndex - 1 + members.length) % members.length;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = members.length - 1;
      }

      if (next === null) {
        return;
      }

      event.preventDefault();
      activate(next);
      focusTab(next);
    },
    [activate, activeIndex, focusTab, members.length],
  );

  useEffect(() => {
    if (members.length === 0) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < members.length; i += 1) {
      const timer = setTimeout(() => {
        setAnimatedOptions((prev) => (prev.includes(i) ? prev : [...prev, i]));
      }, 180 * i);
      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [members.length]);

  if (members.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative flex w-full flex-col items-center", className)}>
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Team members"
        onKeyDown={onTablistKeyDown}
        className="options flex h-[360px] w-full max-w-[900px] items-stretch overflow-x-auto overflow-y-hidden md:h-[400px]"
      >
        {members.map((member, index) => {
          const isActive = activeIndex === index;
          const isHovered = hoveredIndex === index;
          const isColorized = isActive || isHovered;
          const photoUrl = getCmsImageUrl(member.photo);
          const key = member._id ?? `${member.name}-${member.order}`;
          const panelId = `${baseId}-panel-${index}`;
          const tabId = `${baseId}-tab-${index}`;
          const isAnimated = animatedOptions.includes(index);

          return (
            <div
              key={key}
              data-team-option={index}
              className={cn(
                "option relative flex min-h-[100px] min-w-[60px] flex-col justify-end overflow-hidden border-2 border-[var(--color-primary)] transition-all duration-700 ease-in-out will-change-[flex-grow,box-shadow,filter]",
                isActive
                  ? "z-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                  : "z-[1] shadow-[0_10px_30px_rgba(0,0,0,0.2)]",
                isColorized ? "grayscale-0" : "grayscale",
                isAnimated
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-[60px] opacity-0",
              )}
              style={{
                flex: isActive ? "7 1 0%" : "1 1 0%",
                backgroundColor: "var(--bg-accent)",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() =>
                setHoveredIndex((current) => (current === index ? null : current))
              }
            >
              <button
                type="button"
                role="tab"
                id={tabId}
                data-team-tab={index}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                className="absolute inset-0 z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]"
                onClick={() => activate(index)}
                onFocus={() => activate(index)}
              >
                <span className="sr-only">
                  {member.name}, {member.role}
                </span>
              </button>

              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                aria-hidden="true"
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 70vw, 24rem"
                    className={cn(
                      "size-full object-cover object-[center_22%] transition-[background-size] duration-700",
                      isActive ? "scale-100" : "scale-110",
                    )}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[var(--bg-accent)]">
                    <span className="font-display text-2xl font-bold text-sakura-ink md:text-3xl">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-2/5 bg-gradient-to-t from-[var(--bg-secondary)] via-[var(--bg-secondary)]/70 to-transparent transition-opacity duration-700",
                  isActive ? "opacity-100" : "opacity-50",
                )}
                aria-hidden="true"
              />

              <div
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
                hidden={!isActive}
                className="label pointer-events-none absolute inset-x-0 bottom-5 z-[3] flex w-full items-end justify-start px-4"
              >
                <div className="info relative min-w-0 pb-1 text-white">
                  <div
                    className="main font-display text-lg font-bold transition-all duration-700 ease-in-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateX(0)" : "translateX(25px)",
                    }}
                  >
                    {isActive ? member.name : null}
                  </div>
                  <div
                    className="sub text-base text-white/80 transition-all duration-700 ease-in-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateX(0)" : "translateX(25px)",
                    }}
                  >
                    {isActive ? member.role : null}
                  </div>
                  {isActive && member.socialLinks.length > 0 ? (
                    <ul className="pointer-events-auto mt-2 flex flex-wrap gap-2">
                      {member.socialLinks.map((link) => (
                        <li key={`${link.platform}-${link.url}`}>
                          <TeamSocialLink link={link} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {members.length >= 2 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous team member"
            onClick={() => goToRelative(-1)}
            className="inline-flex size-9 items-center justify-center border-2 border-[var(--color-primary)] text-[var(--color-primary)] transition-colors duration-200 hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next team member"
            onClick={() => goToRelative(1)}
            className="inline-flex size-9 items-center justify-center border-2 border-[var(--color-primary)] text-[var(--color-primary)] transition-colors duration-200 hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TeamSocialLink({ link }: { link: SocialLink }) {
  const platform = link.platform as SocialPlatformIconName;
  const label = SOCIAL_PLATFORM_LABELS[platform] ?? link.label;
  const isEmail = platform === "email";

  return (
    <a
      href={link.url}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      rel={isEmail ? undefined : "noopener noreferrer"}
      target={isEmail ? undefined : "_blank"}
    >
      <SocialPlatformIcon platform={platform} size={16} />
    </a>
  );
}

export default InteractiveSelector;
