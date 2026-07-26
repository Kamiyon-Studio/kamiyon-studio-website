"use client";

import Image from "next/image";
import { useRef } from "react";

import { AnimatedImage } from "@/components/animation/AnimatedImage";
import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { AnimatedText } from "@/components/animation/AnimatedText";
import { MotionButton } from "@/components/animation/MotionButton";
import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { useParallax } from "@/hooks/useParallax";
import { useStagger } from "@/hooks/useStagger";
import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/constants";

const DEMO_CARDS = [
  { title: "Reveal", body: "Viewport fade-up via AnimatedSection." },
  { title: "Stagger", body: "Children enter with a shared stagger." },
  { title: "Parallax", body: "Scrubbed motion on fine pointers." },
  { title: "Lenis", body: "Smooth scroll paired with ScrollTrigger." },
] as const;

function MotionLabHero() {
  const heroRef = useHeroAnimation<HTMLElement>();

  return (
    <header
      ref={heroRef}
      className="relative overflow-hidden border-b border-[var(--border-default)] bg-[linear-gradient(165deg,var(--color-ivory)_0%,#fff_45%,color-mix(in_srgb,var(--color-sakura)_12%,white)_100%)]"
    >
      <Container className="flex min-h-[70vh] flex-col justify-center gap-6 py-20">
        <p
          data-hero-brand
          className="font-display text-sm font-semibold tracking-[0.2em] text-sakura-ink uppercase"
        >
          Kamiyon Studio · Motion Lab
        </p>
        <h1
          data-hero-headline
          className="max-w-3xl font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl"
        >
          Developer demo for GSAP, ScrollTrigger, and Lenis.
        </h1>
        <p className="max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
          Not a marketing page — a sandbox that exercises the shared animation
          architecture. Hidden from primary navigation.
        </p>
        <div data-hero-cta className="flex flex-wrap gap-3 pt-2">
          <MotionButton href="#fade-sections">Explore patterns</MotionButton>
          <MotionButton href="/" variant="secondary">
            Back to site
          </MotionButton>
        </div>
      </Container>
    </header>
  );
}

function StaggerCards() {
  const listRef = useStagger<HTMLUListElement>({
    stagger: 0.12,
    y: 28,
  });

  return (
    <ul
      ref={listRef}
      className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {DEMO_CARDS.map((card) => (
        <li
          key={card.title}
          className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {card.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{card.body}</p>
        </li>
      ))}
    </ul>
  );
}

function ParallaxBand() {
  const parallaxRef = useParallax<HTMLDivElement>({ speed: 100 });

  return (
    <div className="relative mt-10 h-64 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)]">
      <div ref={parallaxRef} className="absolute inset-[-20%] will-change-transform">
        <Image
          src="/assets/background.png"
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </div>
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-charcoal)_35%,transparent)]" />
      <p className="relative z-10 flex h-full items-end p-6 font-display text-xl font-semibold text-white">
        Parallax image (fine pointer)
      </p>
    </div>
  );
}

function ScrollTimelineDemo() {
  const scopeRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    scopeRef,
    () => {
      const root = scopeRef.current;
      if (!root) {
        return;
      }

      const stages = root.querySelectorAll("[data-timeline-stage]");
      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(stages, { autoAlpha: 1, x: 0 });
      });

      mm.add(GSAP_ALLOW_MOTION, () => {
        const tl = gsap.timeline({
          scrollTrigger: createScrollTriggerDefaults({
            trigger: root,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.6,
          }),
        });

        tl.fromTo(
          stages,
          { autoAlpha: 0.25, x: 40 },
          {
            autoAlpha: 1,
            x: 0,
            stagger: 0.2,
            ease: MOTION_EASE.inOut,
            duration: MOTION_DURATION.base,
          },
        );
      });
    },
    [],
  );

  return (
    <div ref={scopeRef} className="mt-10 grid gap-4">
      {["Plan", "Build", "Polish"].map((label, index) => (
        <div
          key={label}
          data-timeline-stage
          className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 font-display text-lg font-semibold text-[var(--text-primary)]"
        >
          <span className="mr-3 text-sakura-ink">{index + 1}.</span>
          {label}
        </div>
      ))}
    </div>
  );
}

export function MotionLabClient() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)]">
      <MotionLabHero />

      <section id="fade-sections" className="py-20">
        <Container>
          <WordPullUp
            as="h2"
            words="Word pull-up headings"
            className="text-3xl tracking-tight md:text-4xl"
          />
          <AnimatedSection as="div" delay={0.08}>
            <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
              Standard: headings use WordPullUp; body copy fades via
              AnimatedSection / useFadeIn (ScrollTrigger). Prefer this pairing
              over wrapping an entire section in one fade.
            </p>
          </AnimatedSection>
        </Container>
      </section>

      <AnimatedSection className="border-t border-[var(--border-default)] py-20">
        <Container>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Stagger cards
          </h2>
          <AnimatedText
            as="p"
            className="mt-3 flex flex-wrap gap-x-2 text-[var(--text-muted)]"
          >
            <span>Word</span>
            <span>stagger</span>
            <span>via</span>
            <span>AnimatedText</span>
            <span>child</span>
            <span>nodes.</span>
          </AnimatedText>
          <StaggerCards />
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-[var(--border-default)] py-20">
        <Container>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Image reveal
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            AnimatedImage wraps media with a clip-path / fade reveal.
          </p>
          <div className="mt-10 max-w-xl">
            <AnimatedImage
              src="/assets/kami-chan-concept-art.png"
              alt="Kami-chan concept art used as motion-lab sample media"
              width={720}
              height={720}
              className="h-auto w-full rounded-[var(--radius-card)]"
            />
          </div>
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-[var(--border-default)] py-20">
        <Container>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Parallax
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            useParallax scrubs on fine pointers and disables under reduced
            motion.
          </p>
          <ParallaxBand />
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-[var(--border-default)] py-20">
        <Container>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Scroll-triggered timeline
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            Inline timeline scrubbed to scroll progress.
          </p>
          <ScrollTimelineDemo />
        </Container>
      </AnimatedSection>

      <AnimatedSection className="border-t border-[var(--border-default)] py-20">
        <Container className="flex flex-col items-start gap-4">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Animated CTA
          </h2>
          <p className="max-w-2xl text-[var(--text-muted)]">
            GSAP entrance on the section plus Framer Motion hover/tap on the
            button.
          </p>
          <MotionButton href="/contact">Talk with Kamiyon</MotionButton>
        </Container>
      </AnimatedSection>

      <footer className="border-t border-[var(--border-default)] py-10">
        <Container>
          <p className="text-sm text-[var(--text-muted)]">
            Smooth scrolling is provided site-wide by Lenis (disabled when
            prefers-reduced-motion is set). This route is intentionally omitted
            from PRIMARY_NAV_ITEMS.
          </p>
        </Container>
      </footer>
    </div>
  );
}
