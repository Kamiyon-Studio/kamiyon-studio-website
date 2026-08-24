import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SITE_MOTTO } from "@/lib/seo/constants";
import { HeroBrand } from "./HeroBrand";

vi.mock("@/components/ui/SplitText", () => ({
  SplitText: ({
    text,
    tag: Tag = "p",
    className,
  }: {
    text: string;
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
    className?: string;
  }) => <Tag className={className}>{text}</Tag>,
}));

describe("HeroBrand", () => {
  it("renders the wordmark and motto", () => {
    render(<HeroBrand />);

    expect(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    ).toBeInTheDocument();
    expect(screen.getByText(SITE_MOTTO)).toBeInTheDocument();
  });

  it("glows the wordmark with the primary color instead of a drop shadow", () => {
    render(<HeroBrand />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "KAMIYON STUDIO",
    });
    const glowHost = heading.parentElement;

    expect(glowHost?.className).toMatch(/--color-primary/);
    expect(glowHost?.className).toMatch(/0_0_/);
    expect(heading.className).not.toMatch(/drop-shadow/);
  });
});
