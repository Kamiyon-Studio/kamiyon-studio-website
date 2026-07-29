import { Timeline, type TimelineEntry } from "@/components/ui/timeline";

export type StoryTimelineProps = {
  heading: string;
  summary: string;
  entries: TimelineEntry[];
};

/**
 * About-page wrapper around the reusable Timeline primitive.
 * Does not wrap itself in AnimatedSection — scroll ownership stays with GSAP.
 */
export function StoryTimeline({ heading, summary, entries }: StoryTimelineProps) {
  return (
    <Timeline
      id="timeline"
      heading={heading}
      summary={summary}
      entries={entries}
    />
  );
}
