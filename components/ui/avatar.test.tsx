import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("renders the fallback initials when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>FA</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("FA")).toBeInTheDocument();
  });

  it("merges a custom className onto the root", () => {
    const { container } = render(
      <Avatar className="size-9">
        <AvatarFallback>FA</AvatarFallback>
      </Avatar>,
    );

    expect(container.firstChild).toHaveClass("size-9");
  });

  it("accepts an image alongside the fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="/assets/background.avif"
          alt="Fixture Author portrait"
        />
        <AvatarFallback>FA</AvatarFallback>
      </Avatar>,
    );

    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("FA")).toBeInTheDocument();
  });
});
