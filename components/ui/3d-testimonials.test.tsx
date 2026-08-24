import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Marquee } from "./3d-testimonials";

describe("Marquee", () => {
  it("repeats children the requested number of times", () => {
    render(
      <Marquee repeat={3} ariaLabel="Fixture marquee">
        <span>Fixture item</span>
      </Marquee>,
    );

    expect(screen.getAllByText("Fixture item")).toHaveLength(3);
  });

  it("applies the horizontal marquee animation by default", () => {
    render(
      <Marquee repeat={1}>
        <span>Fixture item</span>
      </Marquee>,
    );

    const track = screen.getByText("Fixture item").parentElement;
    expect(track?.className).toContain("animate-marquee");
    expect(track?.className).toContain("flex-row");
  });

  it("applies vertical animation classes when vertical is true", () => {
    render(
      <Marquee vertical repeat={1}>
        <span>Fixture item</span>
      </Marquee>,
    );

    const track = screen.getByText("Fixture item").parentElement;
    expect(track?.className).toContain("animate-marquee-vertical");
    expect(track?.className).toContain("flex-col");
  });

  it("reverses and pauses on hover when those flags are set", () => {
    render(
      <Marquee reverse pauseOnHover repeat={1}>
        <span>Fixture item</span>
      </Marquee>,
    );

    const track = screen.getByText("Fixture item").parentElement;
    expect(track?.className).toContain("[animation-direction:reverse]");
    expect(track?.className).toContain("group-hover:[animation-play-state:paused]");
  });

  it("exposes marquee semantics and an optional accessible name", () => {
    render(
      <Marquee ariaLabel="Kind words">
        <span>Fixture item</span>
      </Marquee>,
    );

    expect(
      screen.getByRole("marquee", { name: "Kind words" }),
    ).toHaveAttribute("tabindex", "0");
  });

  it("lets callers take the track out of the tab order", () => {
    render(
      <Marquee ariaRole="presentation" tabIndex={-1} repeat={1}>
        <span>Fixture item</span>
      </Marquee>,
    );

    expect(
      screen.getByText("Fixture item").closest("[data-slot='marquee']"),
    ).toHaveAttribute("tabindex", "-1");
  });
});
