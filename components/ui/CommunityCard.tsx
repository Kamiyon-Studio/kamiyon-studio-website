import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import { getCmsImageUrl } from "@/lib/cms/image";
import { getCommunityTypeLabel } from "@/lib/community/type-labels";
import type { CommunityItem } from "@/lib/cms/types";

type CommunityCardProps = {
  item: CommunityItem;
};

function formatDate(date: string | undefined): string | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CommunityCard({ item }: CommunityCardProps) {
  const coverImageUrl = getCmsImageUrl(item.coverImage);
  const dateLabel = formatDate(item.date);

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <div className="flex h-full min-h-min flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
        <div className="relative aspect-[16/9] bg-[var(--bg-accent)]">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={item.coverImage?.alt ?? item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-4xl"
              aria-hidden="true"
            >
              🌸
            </div>
          )}
          {item.isPlaceholder ? (
            <Badge variant="placeholder" className="absolute left-4 top-4">
              Coming soon
            </Badge>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-1 flex-col p-6">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-sakura-ink">
            <span>{getCommunityTypeLabel(item.type)}</span>
            {dateLabel ? (
              <span className="font-normal normal-case text-[var(--text-muted)]">
                · {dateLabel}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)]">
            {item.title}
          </h3>
          <p className="mt-2 flex-1 text-sm text-[var(--text-secondary)]">{item.summary}</p>
          {item.location ? (
            <p className="mt-3 text-xs text-[var(--text-muted)]">{item.location}</p>
          ) : null}
          {item.externalUrl ? (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm font-medium text-sakura-ink transition-colors hover:opacity-80 focus-visible:outline-offset-2"
            >
              Learn more →
            </a>
          ) : null}
        </div>
      </div>
    </TiltedCard>
  );
}
