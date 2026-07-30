import { Container } from "@/components/ui/Container";
import {
  FocusRail,
  type FocusRailItem,
} from "@/components/ui/focus-rail";
import { WordPullUp } from "@/components/ui/WordPullUp";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { TeamMember } from "@/lib/cms/types";

type TeamGridProps = {
  teamMembers: TeamMember[];
};

/**
 * Atmosphere placeholders when a member has no CMS photo yet.
 * Abstract/creative stills — not portraits — so we never impersonate people.
 */
const TEAM_PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop",
] as const;

function isUsefulBio(bio: string | undefined): boolean {
  const trimmed = bio?.trim() ?? "";
  if (!trimmed) return false;
  return !/^bio coming soon\.?$/i.test(trimmed);
}

export function mapTeamMembersToFocusRailItems(
  members: TeamMember[],
): FocusRailItem[] {
  return members.map((member, index) => {
    const photoUrl = getCmsImageUrl(member.photo);
    const placeholder =
      TEAM_PLACEHOLDER_IMAGES[index % TEAM_PLACEHOLDER_IMAGES.length]!;

    return {
      id: member._id ?? `${member.name}-${member.order}`,
      title: member.name,
      meta: member.role,
      imageSrc: photoUrl ?? placeholder,
      ...(isUsefulBio(member.bio) ? { description: member.bio.trim() } : {}),
      ...(member.socialLinks[0]?.url
        ? { href: member.socialLinks[0].url }
        : {}),
    };
  });
}

export function TeamGrid({ teamMembers }: TeamGridProps) {
  const items = mapTeamMembersToFocusRailItems(teamMembers);

  return (
    <section
      id="team"
      className="bg-[var(--bg-secondary)] py-16 md:py-24"
      aria-labelledby="team-heading"
    >
      <Container>
        <WordPullUp
          as="h2"
          id="team-heading"
          words="Meet the team"
          className="whitespace-nowrap"
        />
      </Container>

      {items.length > 0 ? (
        <div className="mt-10">
          <FocusRail items={items} autoPlay={false} loop />
        </div>
      ) : null}
    </section>
  );
}
