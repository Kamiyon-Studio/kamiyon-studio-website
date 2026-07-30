import type { CSSProperties, ReactNode } from "react";

type MockIcon = {
  prefix?: string;
  iconName?: string;
};

type FontAwesomeIconProps = {
  icon?: MockIcon;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  focusable?: boolean | "true" | "false";
  children?: ReactNode;
};

/** Hermetic stand-in for `@fortawesome/react-fontawesome` under Vitest. */
export function FontAwesomeIcon({
  icon,
  className,
  style,
  ...rest
}: FontAwesomeIconProps) {
  return (
    <svg
      data-icon={icon?.iconName ?? "mock"}
      data-prefix={icon?.prefix ?? "fas"}
      className={className}
      style={style}
      {...rest}
    />
  );
}
