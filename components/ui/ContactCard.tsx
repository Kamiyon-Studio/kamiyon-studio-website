import { Badge } from "@/components/ui/Badge";
import {
  SocialPlatformIcon,
  SOCIAL_PLATFORM_LABELS,
} from "@/components/ui/social-platform-icons";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import type { ContactChannel } from "@/lib/cms/types";

const CHANNEL_LABELS: Record<ContactChannel["type"], string> =
  SOCIAL_PLATFORM_LABELS;

type ContactCardProps = {
  channel: ContactChannel;
};

function getHref(channel: ContactChannel): string {
  if (channel.isPlaceholder) {
    return "#";
  }

  return channel.type === "email" ? `mailto:${channel.value}` : channel.value;
}

const cardClasses =
  "flex h-full flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-offset-2";

export function ContactCard({ channel }: ContactCardProps) {
  const isPlaceholder = Boolean(channel.isPlaceholder);

  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-accent)] text-sakura-ink"
      >
        <SocialPlatformIcon platform={channel.type} size={22} />
      </span>
      <span className="font-display text-base font-semibold text-[var(--text-primary)]">
        {channel.label || CHANNEL_LABELS[channel.type]}
      </span>
      {isPlaceholder ? (
        <Badge variant="placeholder">Coming soon</Badge>
      ) : (
        <span className="break-all text-sm text-[var(--text-secondary)]">
          {channel.value}
        </span>
      )}
    </>
  );

  if (isPlaceholder) {
    return (
      <TiltedCard {...marketingCardTiltProps}>
        <span
          className={`${cardClasses} cursor-not-allowed opacity-70`}
          aria-disabled="true"
        >
          {content}
        </span>
      </TiltedCard>
    );
  }

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <a
        href={getHref(channel)}
        target={channel.type === "email" ? undefined : "_blank"}
        rel={channel.type === "email" ? undefined : "noopener noreferrer"}
        className={cardClasses}
      >
        {content}
      </a>
    </TiltedCard>
  );
}
