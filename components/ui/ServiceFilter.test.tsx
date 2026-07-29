import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ServiceFilter } from "./ServiceFilter";

describe("ServiceFilter", () => {
  it("renders an All chip plus Gate 0 labels for the given services only", () => {
    render(
      <ServiceFilter
        services={["product-development", "branding"]}
        activeService="all"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Product Development" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Branding" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Game Development" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "MVP Development" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "UI/UX Design" })
    ).not.toBeInTheDocument();
  });

  it("marks the active chip with aria-pressed=true", () => {
    render(
      <ServiceFilter
        services={["game-development"]}
        activeService="game-development"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Game Development" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onSelect with the clicked service slug", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <ServiceFilter
        services={["ui-design"]}
        activeService="all"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: "UI & Design" }));

    expect(onSelect).toHaveBeenCalledWith("ui-design");
  });

  it("calls onSelect with 'all' when the All chip is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <ServiceFilter
        services={["branding"]}
        activeService="branding"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(onSelect).toHaveBeenCalledWith("all");
  });
});
