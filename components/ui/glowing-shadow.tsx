"use client";

import type { ReactNode } from "react";

import "./glowing-shadow.css";

type GlowingShadowProps = {
  children: ReactNode;
  className?: string;
};

export function GlowingShadow({ children, className = "" }: GlowingShadowProps) {
  return (
    <span className={`glowing-shadow${className ? ` ${className}` : ""}`}>
      <span className="glowing-shadow__surface">{children}</span>
    </span>
  );
}
