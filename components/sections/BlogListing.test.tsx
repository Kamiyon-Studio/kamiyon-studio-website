import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { postsFallback } from "@/lib/cms/fallbacks/posts";
import { BlogListing } from "./BlogListing";

describe("BlogListing", () => {
  it("renders at least ten posts with distinct datetime values", () => {
    render(<BlogListing posts={postsFallback} />);

    expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();

    const times = screen.getAllByRole("time");
    expect(times.length).toBeGreaterThanOrEqual(10);

    const dateTimes = times.map((node) => node.getAttribute("dateTime"));
    expect(dateTimes.every((value) => typeof value === "string" && value.length > 0)).toBe(
      true,
    );
    expect(new Set(dateTimes).size).toBe(dateTimes.length);
  });

  it("links each post to its detail route", () => {
    render(<BlogListing posts={postsFallback.slice(0, 1)} />);

    const post = postsFallback[0]!;
    expect(
      screen.getByRole("link", { name: new RegExp(post.title, "i") }),
    ).toHaveAttribute("href", `/blog/${post.slug.current}`);
  });
});
