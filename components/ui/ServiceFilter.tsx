import type { ServiceCategoryValue } from "@/lib/cms/taxonomies";
import type { PortfolioServiceFilterValue } from "@/lib/portfolio/filter-by-service";
import { getPortfolioServiceLabel } from "@/lib/portfolio/service-labels";

type ServiceFilterProps = {
  services: ServiceCategoryValue[];
  activeService: PortfolioServiceFilterValue;
  onSelect: (service: PortfolioServiceFilterValue) => void;
};

function chipClasses(isActive: boolean): string {
  const base =
    "inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-offset-2";

  return isActive
    ? `${base} border-sakura bg-sakura text-[var(--text-on-accent)]`
    : `${base} border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]`;
}

/** Presentational portfolio service chips; state lives in PortfolioListing. */
export function ServiceFilter({
  services,
  activeService,
  onSelect,
}: ServiceFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter portfolio by service"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={activeService === "all"}
        onClick={() => onSelect("all")}
        className={chipClasses(activeService === "all")}
      >
        All
      </button>
      {services.map((service) => {
        const label = getPortfolioServiceLabel(service) ?? service;

        return (
          <button
            key={service}
            type="button"
            aria-pressed={activeService === service}
            onClick={() => onSelect(service)}
            className={chipClasses(activeService === service)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
