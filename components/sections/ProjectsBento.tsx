"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  ProgressSlider,
  SliderBtn,
  SliderBtnGroup,
  SliderContent,
  SliderWrapper,
} from "@/components/ui/progressive-carousel";
import { WordPullUp } from "@/components/ui/WordPullUp";
import { getCmsImageUrl } from "@/lib/cms/image";
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

function featuredFirst(caseStudies: CaseStudy[]): CaseStudy[] {
  return [...caseStudies].sort((left, right) => {
    if (left.featured === right.featured) {
      return 0;
    }

    return left.featured ? -1 : 1;
  });
}

export function ProjectsBento({ caseStudies, backgroundSrc }: ProjectsBentoProps) {
  const slides = featuredFirst(caseStudies);
  const hasEarth = Boolean(backgroundSrc);
  const activeSlider = slides[0]?.slug.current ?? "";

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

        {slides.length > 0 ? (
          <AnimatedSection as="div" className="mt-10" delay={0.12}>
            <ProgressSlider
              vertical={false}
              activeSlider={activeSlider}
              className="overflow-hidden rounded-xl"
            >
              <SliderContent>
                {slides.map((item) => {
                  const coverImageUrl = getCmsImageUrl(item.coverImage);

                  return (
                    <SliderWrapper key={item.slug.current} value={item.slug.current}>
                      <Link
                        href={`/portfolio/${item.slug.current}`}
                        aria-label={item.title}
                        className="relative block h-[450px] overflow-hidden rounded-xl 2xl:h-[500px]"
                      >
                        {coverImageUrl ? (
                          <Image
                            src={coverImageUrl}
                            alt={item.coverImage?.alt ?? item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 80vw"
                          />
                        ) : (
                          <span
                            className="flex h-full w-full items-center justify-center bg-[var(--bg-accent)] text-4xl"
                            aria-hidden="true"
                          >
                            🌸
                          </span>
                        )}
                      </Link>
                    </SliderWrapper>
                  );
                })}
              </SliderContent>

              <SliderBtnGroup
                className={cn(
                  "absolute bottom-0 grid h-fit w-full overflow-hidden rounded-md",
                  "bg-[var(--color-charcoal)]/40 text-[var(--color-ivory)] backdrop-blur-md",
                  slides.length === 1 ? "grid-cols-1" : "grid-cols-2",
                  slides.length >= 3 && "md:grid-cols-3",
                  slides.length >= 4 && "md:grid-cols-4",
                )}
              >
                {slides.map((item) => (
                  <SliderBtn
                    key={item.slug.current}
                    value={item.slug.current}
                    className="cursor-pointer border-r border-[var(--color-ivory)]/15 p-3 text-left last:border-r-0"
                    progressBarClass="h-full bg-[var(--color-ivory)]/25"
                  >
                    <h3 className="relative mb-2 w-fit rounded-full bg-[var(--color-ivory)] px-4 text-[var(--color-charcoal)]">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.shortDescription || item.industry}
                    </p>
                  </SliderBtn>
                ))}
              </SliderBtnGroup>
            </ProgressSlider>
          </AnimatedSection>
        ) : null}
      </Container>
    </section>
  );
}
