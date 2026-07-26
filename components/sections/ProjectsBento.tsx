"use client";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { BentoProjectCard } from "@/components/ui/BentoProjectCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";
import { partitionBentoLayout } from "@/lib/home/bento-layout";
import type { CaseStudy } from "@/lib/cms/types";

type ProjectsBentoProps = {
  caseStudies: CaseStudy[];
};

function chunkSlots<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

export function ProjectsBento({ caseStudies }: ProjectsBentoProps) {
  const { large, small } = partitionBentoLayout(caseStudies);
  const smallRows = chunkSlots(small, 3);

  return (
    <section
      id="home-projects"
      className="scroll-mt-4 bg-[var(--bg-primary)] py-16 md:py-24"
    >
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[680px]">
            <AnimatedSection as="div">
              <p className="text-sm font-semibold uppercase tracking-wide text-sakura-ink">
                Portfolio
              </p>
            </AnimatedSection>
            <WordPullUp
              as="h2"
              words="Recent Projects"
              className="mt-3"
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
