"use client";

import { motion } from "motion/react";

import { Container } from "@/components/ui/Container";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { mapTestimonialToMarqueeItem } from "@/lib/cms/mappers";
import type { Testimonial } from "@/lib/cms/types";

type TestimonialsMarqueeProps = {
  testimonials: Testimonial[];
  eyebrow?: string;
  heading?: string;
  summary?: string;
};

export function TestimonialsMarquee({
  testimonials,
  eyebrow = "Testimonials",
  heading = "Kind words",
  summary,
}: TestimonialsMarqueeProps) {
  const reduceMotion = useReducedMotion();

  if (testimonials.length === 0) {
    return null;
  }

  // Home shows `homePage.testimonials` in array order. Do not re-sort by document.order.
  const items = testimonials.map(mapTestimonialToMarqueeItem);

  return (
    <section
      id="home-testimonials"
      data-nav-theme="dark"
      aria-labelledby="home-testimonials-heading"
      className="scroll-mt-4 bg-[var(--bg-secondary)] py-24"
    >
      <Container>
        <motion.div
          initial={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 50, rotate: -2 }
          }
          whileInView={
            reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0 }
          }
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto mb-16 max-w-[540px] text-center">
            <div className="flex justify-center">
              <p className="rounded-full border border-[var(--border-default)] px-4 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                {eyebrow}
              </p>
            </div>
            <h2
              id="home-testimonials-heading"
              className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-[var(--text-primary)]"
            >
              {heading}
            </h2>
            {summary ? (
              <p className="mt-5 text-[var(--text-muted)] text-lg">{summary}</p>
            ) : null}
          </div>
          <TestimonialMarquee items={items} />
        </motion.div>
      </Container>
    </section>
  );
}
