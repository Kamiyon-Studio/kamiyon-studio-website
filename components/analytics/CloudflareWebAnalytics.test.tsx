import type { ComponentPropsWithoutRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CloudflareWebAnalytics } from "./CloudflareWebAnalytics";

vi.mock("next/script", () => ({
  default: (props: ComponentPropsWithoutRef<"script">) => <script {...props} />,
}));

describe("CloudflareWebAnalytics", () => {
  it("renders nothing when the token is missing", () => {
    const { container } = render(<CloudflareWebAnalytics token={undefined} />);

    expect(container.querySelector("script")).toBeNull();
  });

  it("renders nothing when the token is empty or whitespace", () => {
    const { container, rerender } = render(
      <CloudflareWebAnalytics token="" />,
    );

    expect(container.querySelector("script")).toBeNull();

    rerender(<CloudflareWebAnalytics token="   " />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("injects the Cloudflare beacon when a token is set", () => {
    const { container } = render(
      <CloudflareWebAnalytics token="test-cf-token" />,
    );

    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.getAttribute("src")).toBe(
      "https://static.cloudflareinsights.com/beacon.min.js",
    );
    expect(script?.getAttribute("data-cf-beacon")).toBe(
      JSON.stringify({ token: "test-cf-token", spa: true }),
    );
  });
});
