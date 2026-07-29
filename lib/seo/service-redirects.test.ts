import { describe, expect, it } from "vitest";

import {
  SERVICE_PATH_REDIRECTS,
  buildServiceRedirects,
} from "./service-redirects";

describe("SERVICE_PATH_REDIRECTS", () => {
  it("maps Gate 0 + live fold-in old service paths to new destinations", () => {
    expect(SERVICE_PATH_REDIRECTS).toEqual({
      "/services/mvp-development": "/services/product-development",
      "/services/web-development": "/services/product-development",
      "/services/mobile-development": "/services/product-development",
      "/services/ai-integration": "/services/product-development",
      "/services/gamification": "/services/game-development",
      "/services/ui-ux-design": "/services/ui-design",
      "/services/creative-services": "/services",
      "/services/blockchain-solutions": "/services",
      "/services/consultation": "/services",
      "/services/community-growth-management": "/services/community-events",
      "/services/creative-direction-branding": "/services/branding",
      "/services/game-dev": "/services/game-development",
    });
  });

  it("does not redirect the canonical game-development path", () => {
    expect(SERVICE_PATH_REDIRECTS).not.toHaveProperty(
      "/services/game-development"
    );
  });

  it("does not redirect the five new canonical service paths", () => {
    for (const slug of [
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]) {
      expect(SERVICE_PATH_REDIRECTS).not.toHaveProperty(`/services/${slug}`);
    }
  });
});

describe("buildServiceRedirects", () => {
  it("returns permanent Next.js redirect objects for every mapped path", () => {
    const redirects = buildServiceRedirects();

    expect(redirects).toHaveLength(
      Object.keys(SERVICE_PATH_REDIRECTS).length
    );
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/services/mvp-development",
          destination: "/services/product-development",
          permanent: true,
        },
        {
          source: "/services/ui-ux-design",
          destination: "/services/ui-design",
          permanent: true,
        },
        {
          source: "/services/creative-services",
          destination: "/services",
          permanent: true,
        },
        {
          source: "/services/game-dev",
          destination: "/services/game-development",
          permanent: true,
        },
        {
          source: "/services/community-growth-management",
          destination: "/services/community-events",
          permanent: true,
        },
        {
          source: "/services/creative-direction-branding",
          destination: "/services/branding",
          permanent: true,
        },
      ])
    );
    expect(redirects.every((entry) => entry.permanent === true)).toBe(true);
  });
});
