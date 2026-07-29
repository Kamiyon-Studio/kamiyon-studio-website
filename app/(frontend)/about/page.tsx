import type { Metadata } from "next";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { AboutHero } from "@/components/sections/AboutHero";
import { CultureClosing } from "@/components/sections/CultureClosing";
import { OurStory } from "@/components/sections/OurStory";
import { StoryTimeline } from "@/components/sections/StoryTimeline";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { ValuesGrid } from "@/components/sections/ValuesGrid";
import { VisionBand } from "@/components/sections/VisionBand";
import type { TimelineEntry } from "@/components/ui/timeline";
import {
  aboutPageFallback,
  resolveWithFallback,
  teamMembersFallback,
} from "@/lib/cms/fallbacks";
import { getCmsImageUrl } from "@/lib/cms/image";
import { getAboutPage, getTeamMembers } from "@/lib/cms/queries";
import type { StoryTimelineEntry } from "@/lib/cms/types";
import { buildPageMetadata } from "@/lib/seo/metadata";

async function getAboutPageContent() {
  const [aboutPage, teamMembers] = await Promise.all([
    getAboutPage(),
    getTeamMembers(),
  ]);

  return {
    aboutPage: resolveWithFallback(aboutPage, aboutPageFallback),
    teamMembers: resolveWithFallback(teamMembers, teamMembersFallback),
  };
}

function toTimelineEntries(entries: StoryTimelineEntry[]): TimelineEntry[] {
  return entries.flatMap((entry) => {
    const src = getCmsImageUrl(entry.image);
    if (!src) {
      return [];
    }

    return [
      {
        key: entry.key,
        year: entry.year,
        dateLabel: entry.dateLabel,
        ...(entry.date ? { date: entry.date } : {}),
        title: entry.title,
        body: entry.body,
        image: {
          src,
          alt: entry.image?.alt?.trim() || entry.title,
        },
      },
    ];
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { aboutPage } = await getAboutPageContent();

  return buildPageMetadata({
    title: aboutPage.seo.title,
    description: aboutPage.seo.description,
    path: "/about",
    ogImage: aboutPage.seo.ogImage,
    noIndex: aboutPage.seo.noIndex,
  });
}

export default async function AboutPage() {
  const { aboutPage, teamMembers } = await getAboutPageContent();
  const timelineEntries = toTimelineEntries(aboutPage.timelineEntries);
  const timelineHeading =
    aboutPage.timelineHeading.trim() || aboutPageFallback.timelineHeading;
  const timelineSummary =
    aboutPage.timelineSummary.trim() || aboutPageFallback.timelineSummary;
  const storySections =
    aboutPage.storySections.length > 0
      ? aboutPage.storySections
      : aboutPageFallback.storySections;

  return (
    <>
      {/* AboutHero keeps first-viewport presentation; GSAP reveals start below the fold. */}
      <AboutHero aboutPage={aboutPage} />
      <AnimatedSection as="div" distance={28}>
        <OurStory storySections={storySections} />
      </AnimatedSection>
      {/* Scroll timeline owns its own GSAP ScrollTrigger — no outer AnimatedSection. */}
      <StoryTimeline
        heading={timelineHeading}
        summary={timelineSummary}
        entries={timelineEntries}
      />
      <AnimatedSection as="div" distance={32}>
        <VisionBand vision={aboutPage.vision} />
      </AnimatedSection>
      <AnimatedSection as="div" distance={32}>
        <ValuesGrid values={aboutPage.values} />
      </AnimatedSection>
      <AnimatedSection as="div" distance={28}>
        <TeamGrid teamIntro={aboutPage.teamIntro} teamMembers={teamMembers} />
      </AnimatedSection>
      <AnimatedSection as="div" distance={32}>
        <CultureClosing cultureSummary={aboutPage.cultureSummary} />
      </AnimatedSection>
    </>
  );
}
