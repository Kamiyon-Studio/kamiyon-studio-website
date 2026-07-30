export type TimelineEntryType = "news" | "teamJoin";

export type TimelineImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

/** A person shown in the sticky roster; sourced from a Sanity teamMember. */
export type RosterMember = {
  /** Stable key: teamMember `_id` when available, else name-derived slug. */
  id: string;
  name: string;
  role: string;
  /** Null when the member has no renderable photo — cell falls back to initials. */
  photo: TimelineImage | null;
};

export type TimelineEntryV2 = {
  key: string;
  entryType: TimelineEntryType;
  year: string; // YYYY — powers the rail
  dateLabel: string; // "March 2024"
  date?: string; // ISO, for <time dateTime>
  title: string;
  body: string;
  /** Always at least one entry; >1 activates the carousel. */
  images: TimelineImage[];
  /** Present only when entryType === "teamJoin". */
  rosterMember?: RosterMember;
};

export type YearRailItem = {
  year: string;
  /** Entry key of the first entry in that year — the scroll target. */
  firstEntryKey: string;
  entryKeys: string[];
};
