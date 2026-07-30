import type { Award } from "../types";

/**
 * Recognition slots shown before real accolades exist in the CMS.
 *
 * Canon rule (context/ai-workflow-rules.md): never fabricate awards,
 * competition wins, or press mentions. These entries name no award and no
 * awarding body — they only reserve the layout and render a "Placeholder"
 * badge. Replace them by publishing `award` documents in Sanity; the CMS list
 * takes over the moment one exists.
 */
export const awardsFallback: Award[] = [
  {
    _type: "award",
    id: "award-slot-1",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 1,
    isPlaceholder: true,
  },
  {
    _type: "award",
    id: "award-slot-2",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 2,
    isPlaceholder: true,
  },
  {
    _type: "award",
    id: "award-slot-3",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 3,
    isPlaceholder: true,
  },
];
