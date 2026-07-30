import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlowingShadow } from "./glowing-shadow";

const cssPath = join(dirname(fileURLToPath(import.meta.url)), "glowing-shadow.css");

describe("GlowingShadow", () => {
  it("renders children inside the surface shell", () => {
    render(
      <GlowingShadow>
        <button type="button">Get in touch</button>
      </GlowingShadow>,
    );

    expect(screen.getByRole("button", { name: "Get in touch" })).toBeInTheDocument();
  });

  it("merges an optional className on the outer shell", () => {
    const { container } = render(
      <GlowingShadow className="mt-4">
        <span>CTA</span>
      </GlowingShadow>,
    );

    expect(container.querySelector(".glowing-shadow")).toHaveClass("mt-4");
  });

  it("does not render nested interactive roles — children supply interactivity", () => {
    render(
      <GlowingShadow>
        <a href="https://example.com/contact">Contact</a>
      </GlowingShadow>,
    );

    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("locks hue animation to the sakura band and sizes for CTA buttons", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(/@keyframes hue-animation/);
    expect(css).toMatch(/hue-rotate\(50deg\)/);
    expect(css).not.toMatch(/hue-rotate\(360deg\)/);
    expect(css).toMatch(/var\(--radius-button\)/);
    expect(css).toMatch(/min-height:\s*44px/);
    expect(css).toMatch(/min-width:\s*44px/);
  });
});
