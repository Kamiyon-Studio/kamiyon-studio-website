import type { Metadata } from "next";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { AboutHero } from "@/components/sections/AboutHero";
import { CultureClosing } from "@/components/sections/CultureClosing";
import { OurStory } from "@/components/sections/OurStory";
import { StoryTimeline } from "@/components/sections/StoryTimeline";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { ValuesGrid } from "@/components/sections/ValuesGrid";
import { VisionBand } from "@/components/sections/VisionBand";
import {
  aboutPageFallback,
  resolveWithFallback,
  teamMembersFallback,
} from "@/lib/cms/fallbacks";
import { getCmsImageUrl } from "@/lib/cms/image";
import { getAboutPage, getTeamMembers } from "@/lib/cms/queries";
import type { StoryTimelineEntry } from "@/lib/cms/types";
import type { TimelineEntryV2, TimelineImage } from "@/lib/timeline";
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

function toTimelineImage(
  image: { url?: string; key?: string; alt?: string | null } | undefined,
  fallbackAlt: string,
): TimelineImage | null {
  const src = getCmsImageUrl(image);
  if (!src) {
    return null;
  }
  return {
    src,
    alt: image?.alt?.trim() || fallbackAlt,
  };
}

function toTimelineEntries(entries: StoryTimelineEntry[]): TimelineEntryV2[] {
  return entries.flatMap((entry) => {
    const images = entry.images
      .map((image) => toTimelineImage(image, entry.title))
      .filter((image): image is TimelineImage => image !== null);

    if (images.length === 0) {
      return [];
    }

    const rosterMember = entry.teamMember
      ? {
          id: entry.teamMember.id,
          name: entry.teamMember.name,
          role: entry.teamMember.role,
          photo: toTimelineImage(entry.teamMember.photo, entry.teamMember.name),
        }
      : undefined;

    return [
      {
        key: entry.key,
        entryType: entry.entryType,
        year: entry.year,
        dateLabel: entry.dateLabel,
        ...(entry.date ? { date: entry.date } : {}),
        title: entry.title,
        body: entry.body,
        images,
        ...(rosterMember ? { rosterMember } : {}),
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
