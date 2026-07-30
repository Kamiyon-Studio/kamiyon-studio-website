/** Hermetic stand-in for `@fortawesome/fontawesome-svg-core` under Vitest. */
export const config = {
  autoAddCss: true,
};

export type IconDefinition = {
  prefix: string;
  iconName: string;
  icon: [number, number, string[], string, string];
};
