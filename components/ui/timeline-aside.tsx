"use client";

import Image from "next/image";
import type { JSX } from "react";

import type { RosterMember, YearRailItem } from "@/lib/timeline";
import { getInitials } from "@/lib/team/initials";
import { cn } from "@/lib/utils";

export type TimelineAsideProps = {
  rail: YearRailItem[];
  activeYear: string | null;
  roster: RosterMember[];
  onYearSelect: (item: YearRailItem) => void;
  className?: string;
};

export function TimelineAside({
  rail,
  activeYear,
  roster,
  onYearSelect,
  className,
}: TimelineAsideProps): JSX.Element {
  return (
    <aside
      data-testid="timeline-year-rail"
      className={cn("hidden xl:block", className)}
      aria-label="Timeline aside"
    >
      <div className="sticky top-24 space-y-10">
        <nav aria-label="Timeline years" className="space-y-2">
          {rail.map((item) => {
            const isActive = item.year === activeYear;
            return (
              <button
                key={item.year}
                type="button"
                className={cn(
                  "flex min-h-11 w-full items-center justify-end gap-2 px-1 text-right font-display text-2xl font-bold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sakura)]",
                  isActive
                    ? "text-[var(--color-ivory)]"
                    : "text-[var(--color-ivory)]/35 hover:text-[var(--color-ivory)]/70",
                )}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onYearSelect(item)}
              >
                <span
                  className={cn(
                    "h-0.5 w-4 shrink-0 rounded-full",
                    isActive ? "bg-[var(--color-sakura)]" : "bg-transparent",
                  )}
                  aria-hidden="true"
                />
                {item.year}
              </button>
            );
          })}
        </nav>

        <div data-testid="timeline-roster">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-[var(--color-ivory)]/50 uppercase">
            Roster
          </p>

          {roster.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-ivory)]/40">
              The team grows as the story unfolds.
            </p>
          ) : (
            <ul className="mt-4 grid list-none grid-cols-3 gap-2 p-0">
              {roster.map((member) => (
                <li key={member.id} className="min-w-0">
                  <div
                    {...(member.photo?.src
                      ? {}
                      : {
                          role: "img" as const,
                          "aria-label": `${member.name}${member.role ? `, ${member.role}` : ""}`,
                        })}
                    className="relative aspect-square min-h-11 overflow-hidden rounded-md border border-[var(--color-ivory)]/15 bg-[var(--color-charcoal)]"
                    title={`${member.name}${member.role ? ` — ${member.role}` : ""}`}
                  >
                    {member.photo?.src ? (
                      <Image
                        src={member.photo.src}
                        alt={member.photo.alt || member.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="font-display text-sm font-bold text-[var(--color-sakura)]">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
