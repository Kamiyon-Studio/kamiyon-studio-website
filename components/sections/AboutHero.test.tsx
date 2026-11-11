import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AboutPage } from "@/lib/cms/types";

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
  it("renders the About title and CMS mission", () => {
    render(<AboutHero aboutPage={baseAboutPage} />);

    const heading = screen.getByRole("heading", { level: 1, name: "ABOUT US" });
    const hero = heading.closest("section");

    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(screen.getByText(baseAboutPage.mission)).toBeInTheDocument();
    expect(screen.queryByText(baseAboutPage.motto)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Our values" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meet the team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Contact us" })).not.toBeInTheDocument();
  });
});
