"use client";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";

export type ServiceStackSlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  exploreHref: string;
};

type ServicesStackProps = {
  slides: ServiceStackSlide[];
};

const sectionId = "services-stack-heading";

/* Opaque gradient only — alpha fills cause stacked cards to bleed through each other. */
const cardClassName =
  "flex flex-col justify-end border border-white/10 bg-gradient-to-br from-[var(--color-charcoal)] via-[#8a2f4a] to-[var(--color-sakura-ink)] text-[var(--color-ivory)]";

export function ServicesStack({ slides }: ServicesStackProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      id="home-services"
      aria-labelledby={sectionId}
      className="scroll-mt-4 bg-[var(--bg-primary)] py-16 md:py-24"
    >
      <Container>
        <div className="max-w-[680px]">
          <AnimatedSection as="div">
            <p className="text-sm font-semibold uppercase tracking-wide text-sakura-ink">
              Services
            </p>
          </AnimatedSection>
          <WordPullUp
            as="h2"
            id={sectionId}
            words="What we build"
            className="mt-3"
          />
        </div>

        <ScrollStack
          className="mt-6 md:mt-8"
          useWindowScroll
          itemDistance={100}
          itemScale={0.04}
          itemStackDistance={36}
          stackPosition="16%"
          scaleEndPosition="8%"
          baseScale={0.86}
          rotationAmount={0}
        >
          {slides.map((slide) => (
            <ScrollStackItem key={slide.id} itemClassName={cardClassName}>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-gold)]">
                {slide.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[20ch] font-display text-2xl font-bold leading-tight text-[var(--color-ivory)] md:text-4xl">
                {slide.title}
              </h3>
              <p className="mt-4 max-w-[42rem] text-base text-[var(--color-ivory)]/90 md:text-lg">
                {slide.summary}
              </p>
              <div className="mt-8">
                <Button
                  href={slide.exploreHref}
                  variant="ghost"
                  className="text-[var(--color-ivory)] hover:bg-white/10 hover:text-[var(--color-ivory)]"
                >
                  Explore
                </Button>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </Container>
    </section>
  );
}
