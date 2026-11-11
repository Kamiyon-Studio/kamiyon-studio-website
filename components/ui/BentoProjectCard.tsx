import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { CaseStudy } from "@/lib/cms/types";

type BentoProjectCardProps = {
  caseStudy: CaseStudy | null;
  size?: "large" | "small";
};

const cardClasses =
  "group flex h-full min-h-min flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-offset-2";

const imageAspectClasses = {
  large: "aspect-[4/3]",
  small: "aspect-[16/10]",
} as const;

function BentoCardContent({ industry, title }: { industry: string; title: string }) {
  return (
    <div className="flex shrink-0 flex-col p-4 md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-sakura-ink md:text-sm">
        {industry}
      </p>
      <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold text-[var(--text-primary)] md:text-lg">
        {title}
      </h3>
    </div>
  );
}

export function BentoProjectCard({ caseStudy, size = "large" }: BentoProjectCardProps) {
  if (!caseStudy) {
    return (
      <TiltedCard {...marketingCardTiltProps}>
        <span
          className={`${cardClasses} cursor-not-allowed opacity-70`}
          aria-disabled="true"
          data-bento-size={size}
        >
          <div className={`relative bg-[var(--bg-accent)] ${imageAspectClasses[size]}`}>
            <div
              className="flex h-full w-full items-center justify-center text-4xl"
              aria-hidden="true"
            >
              🌸
            </div>
            <Badge variant="placeholder" className="absolute left-4 top-4">
              Placeholder
            </Badge>
          </div>
          <BentoCardContent industry="Case study" title="Project coming soon" />
        </span>
      </TiltedCard>
    );
  }

  const coverImageUrl = getCmsImageUrl(caseStudy.coverImage);

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <Link
        href={`/portfolio/${caseStudy.slug.current}`}
        className={cardClasses}
        data-bento-size={size}
      >
        <div className={`relative bg-[var(--bg-accent)] ${imageAspectClasses[size]}`}>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={caseStudy.coverImage?.alt ?? caseStudy.title}
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
          {caseStudy.isPlaceholder ? (
            <Badge variant="placeholder" className="absolute left-4 top-4">
              Placeholder
            </Badge>
          ) : null}
        </div>
        <BentoCardContent industry={caseStudy.industry} title={caseStudy.title} />
      </Link>
    </TiltedCard>
  );
}
