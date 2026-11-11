import { Container } from "@/components/ui/Container";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import type { HomeHighlights } from "@/lib/cms/types";

type HighlightsProps = {
  highlights: HomeHighlights;
};

export function Highlights({ highlights }: HighlightsProps) {
  return (
    <section className="bg-[var(--bg-secondary)] py-16 md:py-24">
      <Container>
        <h2 className="text-center font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          {highlights.title}
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.items.map((item) => (
            <TiltedCard key={item.title} {...marketingCardTiltProps}>
              <div className="h-full rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-accent)] text-sakura-ink"
                  aria-hidden="true"
                >
                  ✦
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.description}</p>
              </div>
            </TiltedCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
