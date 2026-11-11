import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Hero } from "./Hero";

afterEach(() => vi.unstubAllEnvs());

describe("Hero", () => {
  it.each([undefined, "https://media.kamiyonstudio.com"])(
    "keeps the opening static with media CDN %s",
    (baseUrl) => {
      vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", baseUrl);
      const { container } = render(<Hero />);

      expect(screen.getByRole("heading", { level: 1, name: "Kamiyon Studio" })).toBeInTheDocument();
      expect(container.querySelector('img[src*="background.avif"]')).toBeInTheDocument();
      expect(container.querySelector("video")).toBeNull();
      expect(container.querySelector('[data-testid="hero-parallax-stage"]')).toBeNull();
      expect(container.querySelector("[data-opening-curtain]")).toBeNull();
    },
  );
});
