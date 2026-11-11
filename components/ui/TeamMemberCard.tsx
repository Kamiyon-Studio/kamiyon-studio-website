import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import { getCmsImageUrl } from "@/lib/cms/image";
import { getInitials } from "@/lib/team/initials";
import type { TeamMember } from "@/lib/cms/types";

type TeamMemberCardProps = {
  member: TeamMember;
};

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const photoUrl = getCmsImageUrl(member.photo);

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <div className="h-full rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--bg-accent)]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={member.photo?.alt ?? member.name}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              aria-hidden="true"
            >
              <span className="font-display text-3xl font-bold text-sakura-ink">
                {getInitials(member.name)}
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">
          {member.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{member.role}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{member.bio}</p>
        {member.isPlaceholder ? (
          <Badge variant="placeholder" className="mt-4">
            Placeholder
          </Badge>
        ) : null}
      </div>
    </TiltedCard>
  );
}
