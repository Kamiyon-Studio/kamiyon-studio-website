export type HomeSectionNavItem = {
  id: string;
  label: string;
};

/** Section anchors for home page scroll marker — order matches page composition. */
export const HOME_SECTION_NAV: readonly HomeSectionNavItem[] = [
  { id: "home-hero", label: "Hero" },
  { id: "home-partners", label: "Partners" },
  { id: "home-projects", label: "Projects" },
  { id: "home-services", label: "Services" },
  { id: "home-contact", label: "Contact" },
] as const;
