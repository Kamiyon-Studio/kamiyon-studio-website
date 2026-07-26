import Link from "next/link";
import type { ReactNode } from "react";

import { isExternalHref } from "@/lib/navigation/same-route-scroll";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  // Dark text-on-accent (not white) — raw sakura fails AA contrast with white text.
  primary:
    "bg-sakura text-[var(--text-on-accent)] hover:opacity-90 focus-visible:outline-offset-2",
  secondary:
    "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
  ghost:
    "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-sakura-ink",
};

const baseClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-medium transition-[opacity,background-color,color] duration-200 motion-reduce:transition-none";

function isMailOrTel(href: string): boolean {
  return /^(mailto:|tel:)/i.test(href.trim());
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  if ("href" in props && props.href) {
    if (isExternalHref(props.href)) {
      const openInNewTab = !isMailOrTel(props.href);

      return (
        <a
          href={props.href}
          className={classes}
          {...(openInNewTab
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;

  return (
    <button
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
