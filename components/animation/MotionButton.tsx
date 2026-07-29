"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "@/components/ui/Button";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

type MotionButtonProps = ButtonProps & {
  children: ReactNode;
};

/** Thin wrapper around the design-system Button (hover motion lives on SpecularButton). */
export function MotionButton({ children, className = "", ...props }: MotionButtonProps) {
  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  );
}
