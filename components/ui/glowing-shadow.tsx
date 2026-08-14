"use client";

import type { ReactNode } from "react";

import "./glowing-shadow.css";

type GlowingShadowVariant = "button" | "card";

type GlowingShadowProps = {
  children: ReactNode;
  className?: string;
  variant?: GlowingShadowVariant;
};

export function GlowingShadow({
  children,
  className = "",
  variant = "button",
}: GlowingShadowProps) {
  const variantClass = variant === "card" ? " glowing-shadow--card" : "";

  return (
    <span
      className={`glowing-shadow${variantClass}${className ? ` ${className}` : ""}`}
    >
      <span className="glowing-shadow__surface">{children}</span>
    </span>
  );
}
