import type { Testimonial } from "../types";

import { teamMembersFallback } from "./about";

/**
 * Preview quotes so `/#home-testimonials` can be reviewed with real roster
 * names. Replace with consented quotes before treating the band as social
 * proof (ADR-031).
 */
const TEAM_PREVIEW_QUOTES: Record<string, string> = {
  "Sherwin Limosnero":
    "We started Kamiyon to make games that teach, inspire, and still feel like play. That mission is the filter for every decision we make.",
  "Christian Jude Villaber":
    "The best days here are the ones where design, art, and engineering sit in the same room and the mechanic finally clicks.",
  "Ken Cabingas":
    "Kamiyon's voice only works when it's honest. We don't dress up the work — we let the work speak, then make sure people hear it.",
  "Luis Cabrido III":
    "Art here isn't decoration. If a model or a world doesn't help you feel the game, we send it back until it does.",
  "Lucky Guevarra":
    "Community isn't a channel we post into. It's the people we learn from — students, creators, partners — and we treat that as seriously as the product.",
  "Yushua Dapilaga":
    "I get to ship systems with people who care whether the jump feels right. That standard is contagious.",
};

function testimonialIdFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `testimonial-${slug}`;
}

export const testimonialsFallback: Testimonial[] = teamMembersFallback.map(
  (member) => {
    const quote = TEAM_PREVIEW_QUOTES[member.name];
    if (!quote) {
      throw new Error(
        `Missing preview quote for team member "${member.name}".`,
      );
    }

    return {
      _type: "testimonial",
      id: testimonialIdFromName(member.name),
      quote,
      name: member.name,
      role: member.role,
      order: member.order,
    };
  },
);

/** CMS quotes win when present; otherwise show the team-roster preview list. */
export function resolveHomeTestimonials(
  cms: Testimonial[] | null | undefined,
): Testimonial[] {
  if (Array.isArray(cms) && cms.length > 0) {
    return cms;
  }
  return testimonialsFallback;
}
