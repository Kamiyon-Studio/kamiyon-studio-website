"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  SpecularButton,
  type SpecularButtonProps,
} from "@/components/ui/SpecularButton";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: SpecularButtonProps["size"];
  disabled?: boolean;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  onClick?: ComponentPropsWithoutRef<"a">["onClick"];
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Brand-tuned SpecularButton presets — the project-standard CTA look. */
const variantPresets: Record<
  ButtonVariant,
  Pick<
    SpecularButtonProps,
    | "tint"
    | "tintOpacity"
    | "blur"
    | "textColor"
    | "lineColor"
    | "baseColor"
    | "intensity"
    | "shineSize"
    | "shineFade"
    | "thickness"
    | "radius"
  >
> = {
  primary: {
    tint: "#FF7998",
    tintOpacity: 0.94,
    blur: 0,
    textColor: "#201013",
    lineColor: "#ffffff",
    baseColor: "#c24a66",
    intensity: 1.1,
    shineSize: 10,
    shineFade: 40,
    thickness: 1,
    radius: 16,
  },
  secondary: {
    tint: "#ffffff",
    tintOpacity: 0.88,
    blur: 8,
    textColor: "#201013",
    lineColor: "#e9c080",
    baseColor: "#c4a882",
    intensity: 0.9,
    shineSize: 12,
    shineFade: 36,
    thickness: 1,
    radius: 16,
  },
  ghost: {
    tint: "#201013",
    tintOpacity: 0.04,
    blur: 0,
    textColor: "#201013",
    lineColor: "#ff7998",
    baseColor: "#c24a66",
    intensity: 0.75,
    shineSize: 12,
    shineFade: 40,
    thickness: 1,
    radius: 16,
  },
};

/**
 * Project-standard button. SpecularButton (React Bits) with Kamiyon brand presets.
 * Supports native button and link (`href`) modes.
 */
export function Button({
  children,
  variant = "primary",
  className = "",
  size = "md",
  disabled = false,
  ...props
}: ButtonProps) {
  const preset = variantPresets[variant];
  const classes =
    `specular-button--skin-${variant}${className ? ` ${className}` : ""}`.trim();

  if ("href" in props && props.href) {
    return (
      <SpecularButton
        href={props.href}
        onClick={props.onClick}
        size={size}
        disabled={disabled}
        className={classes}
        followMouse
        autoAnimate={false}
        {...preset}
      >
        {children}
      </SpecularButton>
    );
  }

  const buttonProps = props as ButtonAsButton;

  return (
    <SpecularButton
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      size={size}
      disabled={disabled}
      className={classes}
      followMouse
      autoAnimate={false}
      {...preset}
    >
      {children}
    </SpecularButton>
  );
}
