import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TiltedCard, marketingCardTiltProps } from "@/components/ui/TiltedCard";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { CaseStudy } from "@/lib/cms/types";
import { getPortfolioServiceLabel } from "@/lib/portfolio/service-labels";

type ProjectCardProps = {
  caseStudy: CaseStudy;
};

export function ProjectCard({ caseStudy }: ProjectCardProps) {
  const coverImageUrl = getCmsImageUrl(caseStudy.coverImage);
  const serviceLabel = getPortfolioServiceLabel(caseStudy.serviceType);

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <Link
        href={`/portfolio/${caseStudy.slug.current}`}
        className="group flex h-full min-h-min flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-offset-2"
      >
        <div className="relative aspect-[16/9] bg-[var(--bg-accent)]">
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

        <div className="flex shrink-0 flex-1 flex-col p-6">
          {serviceLabel ? (
            <p className="text-sm font-medium uppercase tracking-wide text-sakura-ink">
              {serviceLabel}
            </p>
          ) : null}
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-[var(--text-primary)]">
            {caseStudy.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
            {caseStudy.challenge}
          </p>
          <span className="mt-4 text-sm font-medium text-sakura-ink transition-colors group-hover:opacity-80">
            View case study →
          </span>
        </div>
      </Link>
    </TiltedCard>
  );
}
