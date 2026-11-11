"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode } from "react";
import { isExternalHref } from "@/lib/navigation/same-route-scroll";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
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

export function Button({
  children,
  variant = "primary",
  className = "",
  size = "md",
  disabled = false,
  ...props
}: ButtonProps) {
  const classes = `studio-button studio-button--${variant} studio-button--${size} ${className}`.trim();

  if ("href" in props && props.href) {
    const guardClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      props.onClick?.(event);
    };
    const linkProps = {
      href: props.href,
      className: classes,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : undefined,
      onClick: guardClick,
    };
    if (isExternalHref(props.href)) {
      const newTab = !/^(mailto:|tel:)/i.test(props.href);
      return (
        <a {...linkProps} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    }
    return <Link {...linkProps}>{children}</Link>;
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      type={buttonProps.type ?? "button"}
      disabled={disabled}
      onClick={buttonProps.onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
