import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { Container } from "@/components/ui/Container";
import { LaurelBadge } from "@/components/ui/laurel-badge";
import { WordPullUp } from "@/components/ui/WordPullUp";
import type { Award } from "@/lib/cms/types";

type RecognitionAwardsProps = {
  awards: Award[];
  eyebrow?: string;
  heading?: string;
  summary?: string;
};

/** Widen the grid past two columns only when there is enough to fill it. */
function gridColumnsClass(count: number): string {
  if (count <= 1) {
    return "grid-cols-1";
  }
  if (count === 2) {
    return "grid-cols-1 sm:grid-cols-2";
  }
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

export function RecognitionAwards({
  awards,
  eyebrow = "Recognition",
  heading = "Awards",
  summary,
}: RecognitionAwardsProps) {
  if (awards.length === 0) {
    return null;
  }

  const ordered = [...awards].sort((a, b) => a.order - b.order);

  return (
    <section
      id="home-recognition"
      data-nav-theme="dark"
      aria-labelledby="home-recognition-heading"
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
            id="home-recognition-heading"
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
          <ul
            className={`grid gap-8 md:gap-10 ${gridColumnsClass(ordered.length)}`}
            data-testid="recognition-grid"
          >
            {ordered.map((award) => (
              <li key={award.id}>
                <LaurelBadge
                  label={award.label}
                  title={award.title}
                  organization={award.organization}
                  year={award.year}
                  isPlaceholder={award.isPlaceholder}
                />
              </li>
            ))}
          </ul>
        </AnimatedSection>
      </Container>
    </section>
  );
}
