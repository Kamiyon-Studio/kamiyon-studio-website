import { aboutPageFallback } from "@/lib/cms/fallbacks/about";
import type { AboutPage } from "@/lib/cms/types";

import { arrayKey, toSeo } from "../helpers";
import { SINGLETON_IDS } from "../ids";
import type { SeedDocument } from "../types";

export function buildAboutPageDocument(
  source: AboutPage = aboutPageFallback,
): SeedDocument {
  return {
    _id: SINGLETON_IDS.aboutPage,
    _type: "aboutPage",
    title: source.title,
    storySections: source.storySections.map((section, index) => ({
      _type: "storySection",
      _key: arrayKey("story", index),
      title: section.title,
      body: section.body,
    })),
    timelineHeading: source.timelineHeading,
    timelineSummary: source.timelineSummary,
    timelineEntries: source.timelineEntries.map((entry, index) => ({
      _type: "storyTimelineEntry",
      _key: entry.key || arrayKey("timeline", index),
      entryType: entry.entryType,
      year: entry.year,
      dateLabel: entry.dateLabel,
      ...(entry.date ? { date: entry.date } : {}),
      title: entry.title,
      body: entry.body,
      images: entry.images.map((image, imageIndex) => ({
        _type: "r2Asset",
        _key: image._key || arrayKey(`timeline-img-${index}`, imageIndex),
        ...(image.url ? { url: image.url } : {}),
        ...(image.key ? { key: image.key } : {}),
        ...(image.alt != null ? { alt: image.alt } : {}),
      })),
      ...(entry.teamMember
        ? {
            teamMember: {
              _type: "reference",
              _ref: entry.teamMember.id,
            },
          }
        : {}),
    })),
    mission: source.mission,
    vision: source.vision,
    motto: source.motto,
    values: source.values.map((value, index) => ({
      _type: "coreValue",
      _key: arrayKey("value", index),
      name: value.name,
      description: value.description,
    })),
    cultureSummary: source.cultureSummary,
    ...(source.teamIntro ? { teamIntro: source.teamIntro } : {}),
    seo: toSeo(source.seo),
  };
}
