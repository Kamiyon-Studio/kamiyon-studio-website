import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MotionButton } from "./MotionButton";

describe("MotionButton", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the underlying Button link", () => {
    render(<MotionButton href="/contact">Talk with Kamiyon</MotionButton>);

    expect(
      screen.getByRole("link", { name: "Talk with Kamiyon" }),
    ).toHaveAttribute("href", "/contact");
  });
});
