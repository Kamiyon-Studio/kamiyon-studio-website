"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ServiceFilter } from "@/components/ui/ServiceFilter";
import type { CaseStudy } from "@/lib/cms/types";
import {
  filterPortfolioByService,
  getAvailableServices,
  type PortfolioServiceFilterValue,
} from "@/lib/portfolio/filter-by-service";
import { EmptyState } from "./EmptyState";

type PortfolioListingProps = {
  caseStudies: CaseStudy[];
};

export function PortfolioListing({ caseStudies }: PortfolioListingProps) {
  const availableServices = useMemo(
    () => getAvailableServices(caseStudies),
    [caseStudies]
  );
  const [activeService, setActiveService] =
    useState<PortfolioServiceFilterValue>("all");
  const filteredCaseStudies = useMemo(
    () => filterPortfolioByService(caseStudies, activeService),
    [caseStudies, activeService]
  );

  return (
    <section className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container>
        <div className="max-w-[680px]">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            Portfolio
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
            A look at how we approach client work — the challenge each project
            presented, the solution we built, and the impact it had.
          </p>
        </div>

        {availableServices.length > 0 ? (
          <div className="mt-8">
            <ServiceFilter
              services={availableServices}
              activeService={activeService}
              onSelect={setActiveService}
            />
          </div>
        ) : null}

        {filteredCaseStudies.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCaseStudies.map((caseStudy) => (
              <ProjectCard key={caseStudy.slug.current} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              message={
                caseStudies.length > 0
                  ? "No projects match this filter yet."
                  : "Projects coming soon."
              }
              backHref="/"
              backLabel="Back to home"
            />
          </div>
        )}
      </Container>
    </section>
  );
}
