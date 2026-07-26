import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders as a next/link anchor when an href is provided", () => {
    render(<Button href="/contact">Get in touch</Button>);

    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", "/contact");
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
      </Button>
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
      "button"
    );
  });

  it.each([["primary"], ["secondary"], ["ghost"]] as const)(
    "renders the %s variant without crashing",
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
    }
  );
});
