import type { Service } from "@/lib/cms/types";

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
 * Attach Services dropdown children from published CMS values.
 * Portfolio stays a standalone link (no children).
 * Falls back to no children when services are empty (parent link still works).
 */
export function buildNavItemsWithDropdowns(input: {
  navItems: readonly { label: string; href: string }[];
  services: readonly Service[];
}): NavItemWithDropdown[] {
  const serviceChildren: NavDropdownChild[] = [...input.services]
    .sort((a, b) => a.order - b.order)
    .filter((service) => service.slug.current)
    .map((service) => ({
      label: service.title,
      href: `/services/${service.slug.current}`,
    }));

  return input.navItems.map((item) => {
    if (item.href === "/services" && serviceChildren.length > 0) {
      return { ...item, children: serviceChildren };
    }
    return { ...item };
  });
}
