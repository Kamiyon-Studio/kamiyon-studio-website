import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders as a next/link anchor when an href is provided", () => {
    render(<Button href="/contact">Get in touch</Button>);

    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link).toHaveClass("specular-button");
  });

  it("renders external contact CTAs as new-tab anchors", () => {
    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform";

    render(<Button href={formUrl}>Get in touch</Button>);

    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", formUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders as a native button when no href is provided", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} type="submit">
        Submit
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");

    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("defaults to type='button' when no type is given", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button", { name: "Click me" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it.each([["primary"], ["secondary"], ["ghost"]] as const)(
    "renders the %s SpecularButton skin without crashing",
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      const button = screen.getByRole("button", { name: variant });
      expect(button).toHaveClass("specular-button");
      expect(button).toHaveClass(`specular-button--skin-${variant}`);
    },
  );

  it("uses SpecularButton as the standard primary CTA shell", () => {
    render(<Button variant="primary">Get in touch</Button>);

    const button = screen.getByRole("button", { name: "Get in touch" });
    expect(button).toHaveClass("specular-button");
    expect(button).toHaveClass("specular-button--skin-primary");
    expect(button.querySelector(".specular-button__fx")).toBeInTheDocument();
    expect(button.querySelector(".specular-button__label")).toHaveTextContent(
      "Get in touch",
    );
  });

  it("does not apply primary skin classes to secondary or ghost", () => {
    const { rerender } = render(
      <Button variant="secondary">Learn more</Button>,
    );
    expect(screen.getByRole("button", { name: "Learn more" })).toHaveClass(
      "specular-button--skin-secondary",
    );
    expect(screen.getByRole("button", { name: "Learn more" })).not.toHaveClass(
      "specular-button--skin-primary",
    );

    rerender(<Button variant="ghost">Skip</Button>);
    expect(screen.getByRole("button", { name: "Skip" })).toHaveClass(
      "specular-button--skin-ghost",
    );
  });

  it("renders mailto links without target=_blank", () => {
    render(<Button href="mailto:hello@kamiyon.studio">Email us</Button>);

    const link = screen.getByRole("link", { name: "Email us" });
    expect(link).toHaveAttribute("href", "mailto:hello@kamiyon.studio");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders tel links without target=_blank", () => {
    render(<Button href="tel:+15551234567">Call us</Button>);

    const link = screen.getByRole("link", { name: "Call us" });
    expect(link).toHaveAttribute("href", "tel:+15551234567");
    expect(link).not.toHaveAttribute("target");
  });

  it("marks disabled link CTAs with aria-disabled and removes them from tab order", () => {
    render(
      <Button href="/contact" disabled>
        Contact
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Contact" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabIndex", "-1");
  });

  it("applies primary brand CSS custom properties", () => {
    render(<Button variant="primary">Get in touch</Button>);

    expect(screen.getByRole("button", { name: "Get in touch" })).toHaveStyle({
      "--sb-tint": "#FF7998",
      "--sb-text-color": "#201013",
    });
  });

  it("forwards size presets to SpecularButton", () => {
    render(
      <Button size="lg" href="/services">
        View services
      </Button>,
    );

    expect(screen.getByRole("link", { name: "View services" })).toHaveClass(
      "specular-button--lg",
    );
  });
});
