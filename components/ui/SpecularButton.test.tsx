import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SpecularButton } from "./SpecularButton";

describe("SpecularButton", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders label content and FX layer", () => {
    render(<SpecularButton size="lg">Get Started</SpecularButton>);

    const button = screen.getByRole("button", { name: "Get Started" });
    expect(button).toHaveClass("specular-button--lg");
    expect(button.querySelector(".specular-button__fx")).toBeInTheDocument();
  });

  it("supports link mode for internal hrefs", () => {
    render(<SpecularButton href="/contact">Contact</SpecularButton>);

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("honours disabled state on native buttons", () => {
    render(<SpecularButton disabled>Disabled</SpecularButton>);

    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });
});
