import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { CaseStudy } from "@/lib/cms/types";
import { getPortfolioCardDescription } from "@/lib/portfolio/case-study";
import { getPortfolioServiceLabel } from "@/lib/portfolio/service-labels";

type ProjectCardProps = {
  caseStudy: CaseStudy;
};

export function ProjectCard({ caseStudy }: ProjectCardProps) {
  const coverImageUrl = getCmsImageUrl(caseStudy.coverImage);
  const serviceLabel = getPortfolioServiceLabel(caseStudy.serviceType);
  const description = getPortfolioCardDescription(caseStudy);
  const isOriginalIp = caseStudy.projectType === "original-ip";

  return (
      <Link
        href={`/portfolio/${caseStudy.slug.current}`}
        className="group flex h-full min-h-min flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] transition-colors hover:border-sakura focus-visible:outline-offset-2"
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
              className="flex h-full w-full items-center justify-center p-6 text-center font-display text-2xl text-sakura-ink"
              aria-hidden="true"
            >
              {caseStudy.title}
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
            <p className="text-sm font-medium text-sakura-ink">
              {isOriginalIp ? `${serviceLabel} · Original IP` : serviceLabel}
            </p>
          ) : isOriginalIp ? (
            <p className="text-sm font-medium text-sakura-ink">
              Original IP
            </p>
          ) : null}
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-[var(--text-primary)]">
            {caseStudy.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
          <span className="mt-4 text-sm font-medium text-sakura-ink transition-colors group-hover:opacity-80">
            View case study →
          </span>
        </div>
      </Link>
  );
}
