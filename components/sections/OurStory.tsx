import { Container } from "@/components/ui/Container";
import type { StorySection } from "@/lib/cms/types";

type OurStoryProps = {
  storySections: StorySection[];
};

export function OurStory({ storySections }: OurStoryProps) {
  if (storySections.length === 0) {
    return null;
  }

  return (
    <section
      id="our-story"
      className="bg-[var(--color-charcoal)] py-16 text-[var(--color-ivory)] md:py-24"
      aria-labelledby="our-story-heading"
    >
      <Container className="max-w-6xl">
        <h2
          id="our-story-heading"
          className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-[var(--color-ivory)]"
        >
          OUR STORY
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-2 md:gap-16">
          {storySections.map((section) => (
            <article key={section.title} className="min-w-0">
              <h3 className="font-display text-xl font-semibold text-[var(--color-ivory)] md:text-2xl">
                {section.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-ivory)]/75 md:text-lg">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
