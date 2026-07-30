import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  buildLeafPath,
  LAUREL_LEAF_PATHS,
  LaurelBadge,
  toLines,
} from "./laurel-badge";

describe("laurel geometry", () => {
  it("traces one closed two-curve path per leaf", () => {
    expect(LAUREL_LEAF_PATHS).toHaveLength(16);

    for (const path of LAUREL_LEAF_PATHS) {
      expect(path).toMatch(/^M [\d.-]+ [\d.-]+ Q .+ Q .+ Z$/);
    }
  });

  it("places a leaf at the arc point implied by its angle and radius", () => {
    // Leaf pointing straight up (90°) from the wreath centre at (143.2, 153).
    const path = buildLeafPath([90, 100, 90, 20, 5]);

    expect(path).toBe(
      "M 143.2 63.0 Q 148.2 53.0 143.2 43.0 Q 138.2 53.0 143.2 63.0 Z",
    );
  });

  it("emits fixed-precision coordinates so SSR and hydration match", () => {
    expect(buildLeafPath([124.0, 97.5, 60.5, 28.8, 8.9])).toBe(
      buildLeafPath([124.0, 97.5, 60.5, 28.8, 8.9]),
    );
    expect(LAUREL_LEAF_PATHS[0]).not.toMatch(/\d\.\d\d/);
  });
});

describe("toLines", () => {
  it("splits on real newlines and on literal backslash-n from CMS fields", () => {
    expect(toLines("Gameplay\nDesign Award")).toEqual([
      "Gameplay",
      "Design Award",
    ]);
    expect(toLines("Gameplay\\nDesign Award")).toEqual([
      "Gameplay",
      "Design Award",
    ]);
  });

  it("drops blank lines and surrounding whitespace", () => {
    expect(toLines("  Winner \n\n  Award  ")).toEqual(["Winner", "Award"]);
  });
});

describe("LaurelBadge", () => {
  it("renders the tier and year as a single eyebrow", () => {
    render(
      <LaurelBadge
        label="Winner"
        title="Gameplay Design Award"
        organization="Montreal Independent Games Festival"
        year="2026"
      />,
    );

    expect(screen.getByText("Winner · 2026")).toBeInTheDocument();
    expect(screen.getByText("Gameplay Design Award")).toBeInTheDocument();
    expect(
      screen.getByText("Montreal Independent Games Festival"),
    ).toBeInTheDocument();
  });

  it("omits the eyebrow and organization lines when only a title is given", () => {
    const { container } = render(<LaurelBadge title="Gameplay Design Award" />);

    expect(screen.getByText("Gameplay Design Award")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("renders the tier alone when no year is set", () => {
    render(<LaurelBadge label="Finalist" title="Gameplay Design Award" />);

    expect(screen.getByText("Finalist")).toBeInTheDocument();
  });

  it("renders both laurel branches as decorative SVGs", () => {
    const { container } = render(<LaurelBadge title="Award" />);
    const svgs = container.querySelectorAll("svg");

    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
    // 16 leaves + 1 stem per branch.
    expect(container.querySelectorAll("svg path")).toHaveLength(34);
  });

  it("mirrors the right branch so the leaves lean inward", () => {
    const { container } = render(<LaurelBadge title="Award" />);
    const svgs = container.querySelectorAll("svg");

    expect(svgs[0]?.getAttribute("class")).not.toContain("-scale-x-100");
    expect(svgs[1]?.getAttribute("class")).toContain("-scale-x-100");
  });

  it("labels placeholder slots instead of showing the accolade rule", () => {
    const { rerender, container } = render(
      <LaurelBadge title="Award slot" isPlaceholder />,
    );
    expect(screen.getByText("Placeholder")).toBeInTheDocument();

    rerender(<LaurelBadge title="Real Award" />);
    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();
    expect(container.querySelector(".badge")).toBeNull();
  });

  it("breaks multi-line titles into separate display lines", () => {
    render(<LaurelBadge title={"Gameplay\nDesign Award"} />);

    expect(screen.getByText("Gameplay")).toBeInTheDocument();
    expect(screen.getByText("Design Award")).toBeInTheDocument();
  });
});
