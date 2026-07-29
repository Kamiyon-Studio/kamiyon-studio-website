import { teamMembersFallback } from "@/lib/cms/fallbacks/about";
import type { TeamMember } from "@/lib/cms/types";

import { teamMemberId } from "../ids";
import type { SeedDocument } from "../types";

export function buildTeamMemberDocument(member: TeamMember): SeedDocument {
  // Skip media: photo intentionally omitted.
  return {
    _id: teamMemberId(member.name),
    _type: "teamMember",
    name: member.name,
    role: member.role,
    bio: member.bio,
    socialLinks: member.socialLinks ?? [],
    order: member.order,
    isPlaceholder: member.isPlaceholder,
  };
}

export function buildTeamMemberDocuments(
  source: TeamMember[] = teamMembersFallback
): SeedDocument[] {
  return source.map(buildTeamMemberDocument);
}
