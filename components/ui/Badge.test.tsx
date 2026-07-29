import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Coming soon</Badge>);

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("defaults to the placeholder variant", () => {
    render(<Badge>Placeholder</Badge>);

    expect(screen.getByText("Placeholder").className).toContain("bg-[var(--bg-secondary)]");
  });

  it("applies the info variant classes when specified", () => {
    render(<Badge variant="info">Vision</Badge>);

    expect(screen.getByText("Vision").className).toContain("bg-[var(--bg-accent)]");
  });

  it("merges a custom className with the variant classes", () => {
    render(<Badge className="absolute left-4 top-4">Coming soon</Badge>);

    expect(screen.getByText("Coming soon").className).toContain("absolute left-4 top-4");
  });

  it("uses Skeleton badge primitive classes under the hood", () => {
    render(<Badge>Coming soon</Badge>);

    expect(screen.getByText("Coming soon").className).toContain("badge");
  });
});
