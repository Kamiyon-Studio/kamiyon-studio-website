import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { Container } from "@/components/ui/Container";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { WordPullUp } from "@/components/ui/WordPullUp";
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
      className="scroll-mt-4 bg-[var(--bg-secondary)] py-16 md:py-24"
    >
      <Container>
        <div className="max-w-[680px]">
          <AnimatedSection as="div">
            <p className="text-sm font-semibold uppercase tracking-wide text-sakura-ink">
              {eyebrow}
            </p>
          </AnimatedSection>
          <WordPullUp
            as="h2"
            id="home-testimonials-heading"
            words={heading}
            className="mt-3"
          />
          {summary ? (
            <AnimatedSection as="div" delay={0.08}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                {summary}
              </p>
            </AnimatedSection>
          ) : null}
        </div>

        <AnimatedSection as="div" className="mt-10 md:mt-14" delay={0.12}>
          <TestimonialMarquee items={items} />
        </AnimatedSection>
      </Container>
    </section>
  );
}
