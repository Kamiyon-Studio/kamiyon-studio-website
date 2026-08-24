/**
 * Recognition slots shown before real accolades exist in the CMS.
 *
 * Canon rule (context/ai-workflow-rules.md): never fabricate awards,
 * competition wins, or press mentions. These entries name no award and no
 * awarding body — they only reserve the layout and render a placeholder
 * badge. Replace them by publishing `award` documents in Sanity; the CMS list
 * takes over the moment one exists.
 *
 * RFC §1.2: `placeholderLabel` is CMS-editable badge text (starting set of 3,
 * not a hard cap).
 *
 * Hub owns Award type update for `placeholderLabel` — local intersection until L2.
 */
export type AwardFallbackSlot = {
  _type: "award";
  id: string;
  title: string;
  label?: string;
  organization?: string;
  year?: string;
  order: number;
  isPlaceholder: boolean;
  placeholderLabel: string;
};

export const awardsFallback: AwardFallbackSlot[] = [
  {
    _type: "award",
    id: "award-slot-1",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 1,
    isPlaceholder: true,
    placeholderLabel: "Placeholder",
  },
  {
    _type: "award",
    id: "award-slot-2",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 2,
    isPlaceholder: true,
    placeholderLabel: "Placeholder",
  },
  {
    _type: "award",
    id: "award-slot-3",
    title: "Award slot",
    label: "Recognition",
    organization: "Details coming soon",
    order: 3,
    isPlaceholder: true,
    placeholderLabel: "Placeholder",
  },
];
