import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ContactPage } from "@/lib/cms/types";
import { ContactHero } from "./ContactHero";

const baseContactPage: ContactPage = {
  _type: "contactPage",
  headline: "Let's talk",
  intro: "Reach us through the channels below.",
  channels: [],
  faq: [],
  seo: { title: "", description: "" },
};

describe("ContactHero", () => {
  it("renders the headline and intro", () => {
    render(<ContactHero contactPage={baseContactPage} />);

    expect(screen.getByRole("heading", { level: 1, name: "Let's talk" })).toBeInTheDocument();
    expect(screen.getByText(baseContactPage.intro)).toBeInTheDocument();
  });

  it("includes Send a message and Ways to reach us quick links", () => {
    render(<ContactHero contactPage={baseContactPage} />);

    expect(screen.getByRole("link", { name: "Send a message" })).toHaveAttribute(
      "href",
      "#form"
    );
    expect(screen.getByRole("link", { name: "Ways to reach us" })).toHaveAttribute(
      "href",
      "#methods"
    );
    expect(screen.queryByRole("link", { name: "FAQ" })).not.toBeInTheDocument();
  });

  it("includes the FAQ quick link only when FAQ content exists", () => {
    render(
      <ContactHero
        contactPage={{
          ...baseContactPage,
          faq: [{ question: "Q?", answer: "A." }],
        }}
      />
    );

    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");
  });
});
