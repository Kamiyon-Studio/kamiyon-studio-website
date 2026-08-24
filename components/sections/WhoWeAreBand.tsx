import { Container } from "@/components/ui/Container";
import { WordPullUp } from "@/components/ui/WordPullUp";
import type { CoreValue } from "@/lib/cms/types";

type WhoWeAreBandProps = {
  mission?: string;
  vision?: string;
  motto?: string;
  values?: CoreValue[];
  cultureSummary?: string;
  teamIntro?: string;
};

type Cell = {
  key: string;
  title: string;
  body: string;
};

/** Ivory fill for WordPullUp on charcoal bands (matches OurStory / HomeContact). */
const IVORY_DISPLAY_HEADING =
  "text-[var(--color-ivory)] [background:none] [filter:none] [-webkit-text-fill-color:var(--color-ivory)] [&_.word-pull-up-word]:[background:none] [&_.word-pull-up-word]:[filter:none] [&_.word-pull-up-word]:[-webkit-text-fill-color:var(--color-ivory)]";

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildCells({
  mission,
  vision,
  motto,
  values,
  cultureSummary,
  teamIntro,
}: WhoWeAreBandProps): Cell[] {
  const cells: Cell[] = [];

  if (hasText(mission)) {
    cells.push({ key: "mission", title: "Mission", body: mission.trim() });
  }
  if (hasText(vision)) {
    cells.push({ key: "vision", title: "Vision", body: vision.trim() });
  }
  if (hasText(motto)) {
    cells.push({ key: "motto", title: "Motto", body: motto.trim() });
  }

  for (const value of values ?? []) {
    if (!hasText(value.name) || !hasText(value.description)) {
      continue;
    }
    cells.push({
      key: `value-${value.name.trim()}`,
      title: value.name.trim(),
      body: value.description.trim(),
    });
  }

  if (hasText(cultureSummary)) {
    cells.push({
      key: "culture",
      title: "Culture",
      body: cultureSummary.trim(),
    });
  }
  if (hasText(teamIntro)) {
    cells.push({
      key: "team-intro",
      title: "Team intro",
      body: teamIntro.trim(),
    });
  }

  return cells;
}

export function WhoWeAreBand(props: WhoWeAreBandProps) {
  const cells = buildCells(props);

  if (cells.length === 0) {
    return null;
  }

  return (
    <section
      id="who-we-are"
      className="bg-[var(--color-charcoal)] py-16 text-[var(--color-ivory)] md:py-24"
      aria-labelledby="who-we-are-heading"
    >
      <Container className="max-w-6xl">
        <WordPullUp
          as="h2"
          id="who-we-are-heading"
          words="WHO WE ARE"
          className={IVORY_DISPLAY_HEADING}
        />

        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-2 md:gap-16">
          {cells.map((cell) => (
            <article key={cell.key} className="min-w-0">
              <h3 className="font-display text-xl font-semibold text-[var(--color-ivory)] md:text-2xl">
                {cell.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-ivory)]/75 md:text-lg">
                {cell.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
