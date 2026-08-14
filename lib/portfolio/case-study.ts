import type {
  PortableTextBlock,
  Portfolio,
  PortfolioGameplay,
  PortfolioProjectType,
  PortfolioTechnicalDevelopment,
} from "@/lib/cms/types";
import {
  findTaxonomyTitle,
  isPortfolioProjectType,
  isPortfolioStatus,
  PORTFOLIO_PROJECT_TYPES,
  PORTFOLIO_STATUSES,
} from "@/lib/cms/taxonomies";

export function getPortfolioProjectTypeLabel(
  projectType: string,
): string | undefined {
  if (!isPortfolioProjectType(projectType)) {
    return undefined;
  }
  return findTaxonomyTitle(PORTFOLIO_PROJECT_TYPES, projectType);
}

export function getPortfolioStatusLabel(status: string): string | undefined {
  if (!isPortfolioStatus(status)) {
    return undefined;
  }
  return findTaxonomyTitle(PORTFOLIO_STATUSES, status);
}

/** Sidebar owner row. Original IP must never be labeled "Client". */
export function getPortfolioOwnerLabel(
  projectType: PortfolioProjectType,
): "Studio" | "Client" {
  return projectType === "original-ip" ? "Studio" : "Client";
}

export function getPortfolioCtaLabel(projectType: PortfolioProjectType): string {
  return projectType === "original-ip"
    ? "Get in touch"
    : "Discuss a similar project";
}

export function hasPortableText(
  blocks: PortableTextBlock[] | undefined,
): boolean {
  if (!blocks || blocks.length === 0) {
    return false;
  }

  return blocks.some((block) =>
    block.children.some((child) => child.text.trim().length > 0),
  );
}

export function hasGameplay(
  gameplay: PortfolioGameplay | undefined,
): boolean {
  if (!gameplay) {
    return false;
  }

  const table = gameplay.dualStateTable;
  const hasTable =
    Boolean(table?.leftLabel.trim() || table?.rightLabel.trim()) &&
    Boolean(table?.rows.some((row) => row.aspect.trim() || row.left.trim() || row.right.trim()));

  return (
    hasPortableText(gameplay.mechanics) ||
    hasTable ||
    gameplay.controls.some((control) => control.input.trim() || control.action.trim())
  );
}

export function hasTechnicalDevelopment(
  technical: PortfolioTechnicalDevelopment | undefined,
): boolean {
  if (!technical) {
    return false;
  }

  return Boolean(
    technical.engine?.trim() ||
      technical.platforms?.trim() ||
      technical.input?.trim() ||
      technical.origin?.trim() ||
      technical.systems.some((system) => system.trim()) ||
      hasPortableText(technical.body),
  );
}

export function getPortfolioCardDescription(item: Portfolio): string {
  const short = item.shortDescription.trim();
  if (short) {
    return short;
  }
  return item.challenge;
}
