import { render, screen } from "@testing-library/react";
import { createElement, type ElementType } from "react";
import { describe, expect, it, vi } from "vitest";

import type { AboutPage } from "@/lib/cms/types";

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ComponentProps<"img"> & { fill?: boolean; priority?: boolean }) =>
    createElement("img", props),
}));

vi.mock("@/hooks/useOpeningAnimation", () => ({
  useOpeningAnimation: () => ({ current: null }),
}));

vi.mock("@/hooks/useParallax", () => ({
  useParallax: () => ({ current: null }),
}));

vi.mock("@/components/ui/SplitText", () => ({
  SplitText: ({
    tag = "p",
    text,
    className,
  }: {
    tag?: ElementType;
    text: string;
    className?: string;
  }) => createElement(tag, { className }, text),
}));

import { AboutHero } from "./AboutHero";

const baseAboutPage: AboutPage = {
  _type: "aboutPage",
  title: "About",
  storySections: [],
  timelineHeading: "Our journey",
  timelineSummary: "",
  timelineEntries: [],
  mission: "Create games and interactive experiences that educate and inspire.",
  vision: "A globally recognized multimedia company.",
  motto: "Create. Play. Inspire.",
  values: [],
  cultureSummary: "",
  seo: { title: "", description: "" },
};

describe("AboutHero", () => {
  it("renders ABOUT US as the only hero message", () => {
    render(<AboutHero aboutPage={baseAboutPage} />);

    const heading = screen.getByRole("heading", { level: 1, name: "ABOUT US" });
    const hero = heading.closest("section");

    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(screen.queryByText(baseAboutPage.mission)).not.toBeInTheDocument();
    expect(screen.queryByText(baseAboutPage.motto)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Our values" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meet the team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Contact us" })).not.toBeInTheDocument();
  });
});
