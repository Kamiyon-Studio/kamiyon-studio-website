import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortableText } from "./PortableText";

describe("PortableText", () => {
  it("renders a normal block as a paragraph", () => {
    render(
      <PortableText
        blocks={[
          {
            _type: "block",
            style: "normal",
            children: [{ _type: "span", text: "Hello world" }],
          },
        ]}
      />,
    );

    const span = screen.getByText("Hello world");
    expect(span.parentElement?.tagName).toBe("P");
  });

  it("renders heading styles (h1-h4) as the matching heading tag", () => {
    render(
      <PortableText
        blocks={[
          {
            _type: "block",
            style: "h2",
            children: [{ _type: "span", text: "A heading" }],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "A heading" }),
    ).toBeInTheDocument();
  });

  it("renders a blockquote style as a <blockquote>", () => {
    render(
      <PortableText
        blocks={[
          {
            _type: "block",
            style: "blockquote",
            children: [{ _type: "span", text: "A quote" }],
          },
        ]}
      />,
    );

    expect(screen.getByText("A quote").parentElement?.tagName).toBe(
      "BLOCKQUOTE",
    );
  });

  it("defaults to a paragraph when no style is set", () => {
    render(
      <PortableText
        blocks={[
          { _type: "block", children: [{ _type: "span", text: "Plain" }] },
        ]}
      />,
    );

    expect(screen.getByText("Plain").parentElement?.tagName).toBe("P");
  });

  it("applies strong and em marks to spans", () => {
    render(
      <PortableText
        blocks={[
          {
            _type: "block",
            style: "normal",
            children: [
              { _type: "span", text: "bold text", marks: ["strong"] },
              { _type: "span", text: "italic text", marks: ["em"] },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("bold text").tagName).toBe("STRONG");
    expect(screen.getByText("italic text").tagName).toBe("EM");
  });
});

it("preserves mapped blog links, nested lists, and images while rejecting script links", async () => {
  const { mapPost } = await import("@/lib/cms/mappers");
  const post = mapPost({
    title: "Example",
    publishedAt: "2026-11-11",
    slug: { current: "example" },
    body: [
      {
        _type: "block",
        children: [
          { _type: "span", text: "Reference", marks: ["safe"] },
          { _type: "span", text: "Unsafe", marks: ["unsafe"] },
        ],
        markDefs: [
          { _key: "safe", _type: "link", href: "https://example.com" },
          { _key: "unsafe", _type: "link", href: "javascript:alert(1)" },
        ],
      },
      {
        _type: "block",
        listItem: "number",
        level: 1,
        children: [{ _type: "span", text: "First" }],
      },
      {
        _type: "block",
        listItem: "bullet",
        level: 2,
        children: [{ _type: "span", text: "Nested" }],
      },
      {
        _type: "block",
        listItem: "number",
        level: 1,
        children: [{ _type: "span", text: "Second" }],
      },
      {
        _type: "inlineImage",
        asset: {
          url: "https://media.kamiyonstudio.com/example.webp",
          alt: "Gameplay example",
        },
      },
    ],
  });
  const { container } = render(<PortableText blocks={post!.body} />);
  expect(screen.getByRole("link", { name: "Reference" })).toHaveAttribute(
    "href",
    "https://example.com",
  );
  expect(screen.getByText("Unsafe").closest("a")).toBeNull();
  expect(container.querySelector("ol > li > ul > li")).toHaveTextContent(
    "Nested",
  );
  expect(container.querySelectorAll("ol > li")).toHaveLength(2);
  expect(
    screen.getByRole("img", { name: "Gameplay example" }),
  ).toBeInTheDocument();
});
