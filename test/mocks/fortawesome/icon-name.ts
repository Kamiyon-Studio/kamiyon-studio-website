/** Convert FA export name (`faXTwitter`) to `data-icon` kebab (`x-twitter`). */
export function faExportToIconName(exportName: string): string {
  const withoutFa = exportName.replace(/^fa/, "");
  return withoutFa
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export type MockIconDefinition = {
  prefix: string;
  iconName: string;
  icon: [number, number, string[], string, string];
};

export function createMockIcon(
  exportName: string,
  prefix: "fas" | "fab",
): MockIconDefinition {
  return {
    prefix,
    iconName: faExportToIconName(exportName),
    icon: [512, 512, [], "f000", "M0 0h512v512H0z"],
  };
}
