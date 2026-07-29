import type { Portfolio, Service } from "@/lib/cms/types";

export type NavDropdownChild = {
  label: string;
  href: string;
};

export type NavItemWithDropdown = {
  label: string;
  href: string;
  children?: readonly NavDropdownChild[];
};

/**
 * Build Services/Portfolio dropdown children from published CMS values.
 * Falls back to empty children when collections are empty (parent link still works).
 */
export function buildNavItemsWithDropdowns(input: {
  navItems: readonly { label: string; href: string }[];
  services: readonly Service[];
  portfolioItems: readonly Portfolio[];
}): NavItemWithDropdown[] {
  const serviceChildren: NavDropdownChild[] = [...input.services]
    .sort((a, b) => a.order - b.order)
    .filter((service) => service.slug.current)
    .map((service) => ({
      label: service.title,
      href: `/services/${service.slug.current}`,
    }));

  const portfolioChildren: NavDropdownChild[] = input.portfolioItems
    .filter((item) => item.slug.current)
    .map((item) => ({
      label: item.title,
      href: `/portfolio/${item.slug.current}`,
    }));

  return input.navItems.map((item) => {
    if (item.href === "/services" && serviceChildren.length > 0) {
      return { ...item, children: serviceChildren };
    }
    if (item.href === "/portfolio" && portfolioChildren.length > 0) {
      return { ...item, children: portfolioChildren };
    }
    return { ...item };
  });
}
