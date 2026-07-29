import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { CaseStudy } from "@/lib/cms/types";
import { CONTACT_CTA } from "@/lib/config/navigation";
import {
  getPortfolioServiceHref,
  getPortfolioServiceLabel,
} from "@/lib/portfolio/service-labels";

type ProjectSidebarProps = {
  caseStudy: CaseStudy;
};

function formatPublishedDate(publishedAt: string | undefined): string | null {
  if (!publishedAt) {
    return null;
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export function ProjectSidebar({ caseStudy }: ProjectSidebarProps) {
  const publishedLabel = formatPublishedDate(caseStudy.publishedAt);
  const serviceLabel = getPortfolioServiceLabel(caseStudy.serviceType);
  const serviceHref = getPortfolioServiceHref(caseStudy.serviceType);

  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="font-medium text-[var(--text-muted)]">Client</dt>
          <dd className="mt-1 text-[var(--text-primary)]">{caseStudy.clientName}</dd>
        </div>
        {serviceLabel && serviceHref ? (
          <div>
            <dt className="font-medium text-[var(--text-muted)]">Service</dt>
            <dd className="mt-1">
              <Link
                href={serviceHref}
                className="text-[var(--text-primary)] transition-colors hover:text-sakura-ink focus-visible:outline-offset-2"
              >
                {serviceLabel}
              </Link>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-[var(--text-muted)]">Industry</dt>
          <dd className="mt-1">
            <Link
              href="/portfolio"
              className="text-[var(--text-primary)] transition-colors hover:text-sakura-ink focus-visible:outline-offset-2"
            >
              {caseStudy.industry}
            </Link>
          </dd>
        </div>
        {publishedLabel ? (
          <div>
            <dt className="font-medium text-[var(--text-muted)]">Published</dt>
            <dd className="mt-1 text-[var(--text-primary)]">{publishedLabel}</dd>
          </div>
        ) : null}
      </dl>

      <Button href={CONTACT_CTA.href} variant="primary" className="mt-6 w-full">
        Discuss a similar project
      </Button>
    </aside>
  );
}
