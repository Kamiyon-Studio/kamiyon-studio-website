import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisionBand } from "./VisionBand";

describe("VisionBand", () => {
  it("labels vision content explicitly and never presents it as current fact", () => {
    render(<VisionBand vision="A globally recognized multimedia company." />);

    expect(screen.getByText("Vision — long-term aspiration")).toBeInTheDocument();
    expect(screen.getByText("A globally recognized multimedia company.")).toBeInTheDocument();
  });
});
