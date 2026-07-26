import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";
import { PartnersMarquee } from "./PartnersMarquee";

describe("PARTNER_PLACEHOLDERS", () => {
  it("defines 6–8 static placeholder slots with honest labels", () => {
    expect(PARTNER_PLACEHOLDERS.length).toBeGreaterThanOrEqual(6);
    expect(PARTNER_PLACEHOLDERS.length).toBeLessThanOrEqual(8);
    expect(PARTNER_PLACEHOLDERS.every((slot) => slot.label === "Partner placeholder")).toBe(
      true
    );
    expect(new Set(PARTNER_PLACEHOLDERS.map((slot) => slot.id)).size).toBe(
      PARTNER_PLACEHOLDERS.length
    );
  });
});

describe("PartnersMarquee", () => {
  it("renders each partner slot twice for a seamless infinite loop", () => {
    render(<PartnersMarquee />);

    expect(screen.getAllByText("Partner placeholder")).toHaveLength(
      PARTNER_PLACEHOLDERS.length * 2
    );
  });

  it("renders partner logos as images without links or click actions", () => {
    render(
      <PartnersMarquee
        partners={[
          {
            id: "acme",
            label: "Acme",
            logoUrl: "https://media.kamiyonstudio.com/partners/acme.png",
            logoAlt: "Acme logo",
          },
        ]}
      />,
    );

    const images = screen.getAllByRole("img", { name: "Acme logo", hidden: true });
    expect(images).toHaveLength(2);
    expect(images[0]?.getAttribute("src")).toContain(
      encodeURIComponent("https://media.kamiyonstudio.com/partners/acme.png"),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
  });

  it("renders an optional Partners eyebrow when provided", () => {
    render(<PartnersMarquee eyebrow="Partners" />);

    expect(screen.getByText("Partners")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Partners" })).toBeInTheDocument();
  });

  it("renders an optional Clients eyebrow when provided", () => {
    render(<PartnersMarquee eyebrow="Clients" />);

    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Clients" })).toBeInTheDocument();
  });

  it("omits the eyebrow when not provided", () => {
    render(<PartnersMarquee />);

    expect(screen.queryByText("Partners")).not.toBeInTheDocument();
    expect(screen.queryByText("Clients")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Partner logos" })).toBeInTheDocument();
  });

  it("marks the duplicate track as aria-hidden for assistive tech", () => {
    render(<PartnersMarquee />);

    const lists = screen.getAllByRole("list", { hidden: true });
    expect(lists).toHaveLength(2);
    expect(lists[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes a focusable marquee region that pauses on hover or focus", () => {
    render(<PartnersMarquee />);

    const marquee = screen.getByTestId("partners-marquee-track");
    expect(marquee).toHaveAttribute("tabindex", "0");
  });

  it("ships CSS that disables animation under prefers-reduced-motion", () => {
    const { container } = render(<PartnersMarquee />);
    const style = container.querySelector("style");

    expect(style?.textContent).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(style?.textContent).toMatch(/animation:\s*none/);
  });

  it("ships CSS that pauses the loop on hover and focus-within", () => {
    const { container } = render(<PartnersMarquee />);
    const style = container.querySelector("style");

    expect(style?.textContent).toMatch(/:hover/);
    expect(style?.textContent).toMatch(/:focus-within/);
    expect(style?.textContent).toMatch(/animation-play-state:\s*paused/);
  });
});
