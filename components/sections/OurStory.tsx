import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";
import type { StorySection } from "@/lib/cms/types";

type OurStoryProps = {
  storySections: StorySection[];
};

/** Ivory fill for WordPullUp on charcoal bands (matches HomeContact). */
const IVORY_DISPLAY_HEADING =
  "text-[var(--color-ivory)] [background:none] [filter:none] [-webkit-text-fill-color:var(--color-ivory)] [&_.word-pull-up-word]:[background:none] [&_.word-pull-up-word]:[filter:none] [&_.word-pull-up-word]:[-webkit-text-fill-color:var(--color-ivory)]";

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
        <WordPullUp
          as="h2"
          id="our-story-heading"
          words="OUR STORY"
          className={IVORY_DISPLAY_HEADING}
        />

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
