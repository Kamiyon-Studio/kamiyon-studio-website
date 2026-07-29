"use client";

import Image from "next/image";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";

const DEFAULT_VISUAL_SRC = "/assets/background.jpg";

/** Pointy-top hexagon outline + solid envelope (Fully Illustrated–style contact mark). */
function HexagonMailIcon({ className }: { className?: string }) {
  return (
    <div
      className={className}
      data-testid="home-contact-mail-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 74"
        width={56}
        height={64}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[var(--color-ivory)]"
      >
        {/* Regular pointy-top hexagon — thin ivory stroke */}
        <polygon
          points="32,2.5 59.5,18.25 59.5,55.75 32,71.5 4.5,55.75 4.5,18.25"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        {/* Solid sealed envelope, centered in hex */}
        <path
          fill="currentColor"
          d="M17.5 31.25h29v18.5h-29v-18.5Zm0-2.25 14.5 10.9L46.5 29h-29Z"
        />
      </svg>
    </div>
  );
}

export type HomeContactProps = {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  visualSrc?: string;
};

export function HomeContact({
  heading,
  body,
  ctaLabel,
  ctaHref,
  visualSrc = DEFAULT_VISUAL_SRC,
}: HomeContactProps) {
  return (
    <section
      id="home-contact"
      data-nav-theme="dark"
      aria-labelledby="home-contact-heading"
      className="relative scroll-mt-4 overflow-hidden bg-[var(--color-charcoal)] py-16 md:py-24"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={visualSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[78%_center] md:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-charcoal)]/95 via-[var(--color-charcoal)]/70 to-transparent max-md:via-[var(--color-charcoal)]/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/35 via-transparent to-[var(--color-charcoal)]/45" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-[36rem]">
          <AnimatedSection as="div">
            <HexagonMailIcon />
          </AnimatedSection>
          <WordPullUp
            as="h2"
            id="home-contact-heading"
            words={heading}
            className="mt-4 text-[var(--color-ivory)] [background:none] [filter:none] [-webkit-text-fill-color:var(--color-ivory)] [&_.word-pull-up-word]:[background:none] [&_.word-pull-up-word]:[filter:none] [&_.word-pull-up-word]:[-webkit-text-fill-color:var(--color-ivory)]"
          />
          <AnimatedSection as="div" delay={0.1}>
            <p className="mt-4 max-w-[36rem] text-base text-[var(--color-ivory)]/80 md:text-lg">
              {body}
            </p>
          </AnimatedSection>
          <AnimatedSection as="div" className="mt-8" delay={0.16}>
            <Button
              href={ctaHref}
              variant="ghost"
              className="!text-[var(--color-ivory)] hover:!text-[var(--color-ivory)]"
            >
              {ctaLabel}
            </Button>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}
