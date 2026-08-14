"use client";

import Image from "next/image";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { BentoProjectCard } from "@/components/ui/BentoProjectCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";
import { partitionBentoLayout } from "@/lib/home/bento-layout";
import type { CaseStudy } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type ProjectsBentoProps = {
  caseStudies: CaseStudy[];
  /** Earth plate from the parallax set. Omitted when the media CDN is unavailable. */
  backgroundSrc?: string | null;
};

/** Ivory fill for WordPullUp on the earth plate (matches OurStory / WhoWeAreBand). */
const IVORY_DISPLAY_HEADING =
  "text-[var(--color-ivory)] [background:none] [filter:none] [-webkit-text-fill-color:var(--color-ivory)] [&_.word-pull-up-word]:[background:none] [&_.word-pull-up-word]:[filter:none] [&_.word-pull-up-word]:[-webkit-text-fill-color:var(--color-ivory)]";

function chunkSlots<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

export function ProjectsBento({ caseStudies, backgroundSrc }: ProjectsBentoProps) {
  const { large, small } = partitionBentoLayout(caseStudies);
  const smallRows = chunkSlots(small, 3);
  const hasEarth = Boolean(backgroundSrc);

  return (
    <section
      id="home-projects"
      data-nav-theme="dark"
      className={cn(
        "relative scroll-mt-4 overflow-hidden py-16 md:py-24",
        hasEarth ? "bg-[var(--color-charcoal)]" : "bg-[var(--bg-primary)]",
      )}
    >
      {backgroundSrc ? (
        <div
          data-testid="home-projects-background"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <Image
            src={backgroundSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-charcoal)]/35 to-[var(--color-charcoal)]/75" />
        </div>
      ) : null}

      <Container className="relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[680px]">
            <AnimatedSection as="div">
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  hasEarth ? "text-[var(--color-ivory)]/70" : "text-sakura-ink",
                )}
              >
                Portfolio
              </p>
            </AnimatedSection>
            <WordPullUp
              as="h2"
              words="Recent Projects"
              className={cn("mt-3", hasEarth && IVORY_DISPLAY_HEADING)}
            />
          </div>
          <AnimatedSection as="div" delay={0.08}>
            <Button href="/portfolio" variant="ghost">
              View portfolio
            </Button>
          </AnimatedSection>
        </div>

        <AnimatedSection as="div" className="mt-10 flex flex-col gap-8" delay={0.12}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-bento-row="large">
            {large.map((slot, index) => (
              <BentoProjectCard
                key={slot?.slug.current ?? `large-placeholder-${index}`}
                caseStudy={slot}
                size="large"
              />
            ))}
          </div>

          {smallRows.map((row, rowIndex) => (
            <div
              key={`small-row-${rowIndex}`}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              data-bento-row="small"
            >
              {row.map((slot, index) => (
                <BentoProjectCard
                  key={slot?.slug.current ?? `small-placeholder-${rowIndex}-${index}`}
                  caseStudy={slot}
                  size="small"
                />
              ))}
            </div>
          ))}
        </AnimatedSection>
      </Container>
    </section>
  );
}
