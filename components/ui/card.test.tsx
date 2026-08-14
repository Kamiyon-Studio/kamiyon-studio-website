import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders children and merges className", () => {
    render(<Card className="w-50">Fixture card</Card>);

    const card = screen.getByText("Fixture card");
    expect(card.className).toContain("w-50");
    expect(card.className).toContain("bg-card");
  });

  it("renders header, title, description, content, and footer slots", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Fixture title</CardTitle>
          <CardDescription>Fixture description</CardDescription>
        </CardHeader>
        <CardContent>Fixture content</CardContent>
        <CardFooter>Fixture footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Fixture title")).toBeInTheDocument();
    expect(screen.getByText("Fixture description")).toBeInTheDocument();
    expect(screen.getByText("Fixture content")).toBeInTheDocument();
    expect(screen.getByText("Fixture footer")).toBeInTheDocument();
  });
});
