"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useId,
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

export type HoverExpandProps = {
  members: TeamMember[];
  className?: string;
  /** Index of the strip expanded on mount. Defaults to 0. */
  defaultActiveIndex?: number;
};

/**
 * Accordion-style portrait strip: collapsed columns keep eyes/face framed;
 * the active/hovered column expands and reveals name, role, and socials only.
 */
export function HoverExpand({
  members,
  className,
  defaultActiveIndex = 0,
}: HoverExpandProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const safeDefault =
    members.length === 0
      ? null
      : Math.min(Math.max(defaultActiveIndex, 0), members.length - 1);
  const [activeIndex, setActiveIndex] = useState<number | null>(safeDefault);

  const activate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

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
      setActiveIndex(next);
      const tab = event.currentTarget.querySelector<HTMLElement>(
        `[data-team-tab="${next}"]`,
      );
      tab?.focus();
    },
    [activeIndex, members.length],
  );

  if (members.length === 0) {
    return null;
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeInOut" as const };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.15 }
      }
      className={cn("relative w-full max-w-6xl", className)}
    >
      <div
        role="tablist"
        aria-label="Team members"
        onKeyDown={onTablistKeyDown}
        className="flex w-full items-center justify-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {members.map((member, index) => {
          const isActive = activeIndex === index;
          const photoUrl = getCmsImageUrl(member.photo);
          const key = member._id ?? `${member.name}-${member.order}`;
          const panelId = `${baseId}-panel-${index}`;
          const tabId = `${baseId}-tab-${index}`;

          return (
            <motion.div
              key={key}
              className="relative shrink-0 overflow-hidden rounded-3xl"
              initial={false}
              animate={{
                width: isActive ? "24rem" : "5rem",
                height: "24rem",
              }}
              transition={transition}
              onHoverStart={() => activate(index)}
              onMouseEnter={() => activate(index)}
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

              <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 70vw, 24rem"
                    className="size-full object-cover object-[center_22%]"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[var(--bg-accent)]">
                    <span className="font-display text-2xl font-bold text-sakura-ink md:text-3xl">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    key="overlay"
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabId}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.2 }
                    }
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4"
                  >
                    <p className="font-display text-lg font-semibold text-white md:text-xl">
                      {member.name}
                    </p>
                    <p className="mt-0.5 text-sm text-white/80">{member.role}</p>
                    {member.socialLinks.length > 0 ? (
                      <ul className="pointer-events-auto mt-3 flex flex-wrap gap-2">
                        {member.socialLinks.map((link) => (
                          <li key={`${link.platform}-${link.url}`}>
                            <TeamSocialLink link={link} />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
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

/** Demo shell kept for local previews; production team strip is InteractiveSelector via TeamGrid. */
export function Skiper52({ members }: { members: TeamMember[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <HoverExpand members={members} />
    </div>
  );
}
