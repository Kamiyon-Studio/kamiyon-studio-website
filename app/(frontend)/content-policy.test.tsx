import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/queries", () => ({
  getServiceBySlug: vi.fn(async () => null), getServices: vi.fn(async () => []),
  getPortfolioItemBySlug: vi.fn(async () => null), getPortfolioItems: vi.fn(async () => []),
  getPostBySlug: vi.fn(async () => null), getPosts: vi.fn(async () => []),
}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, usePathname: () => "/" }));
afterEach(() => vi.unstubAllEnvs());

describe("published detail content", () => {
  it("never resurrects known demo slugs in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    const { default: Service } = await import("./services/[slug]/page");
    const { default: Portfolio } = await import("./portfolio/[slug]/page");
    const { default: Blog } = await import("./blog/[slug]/page");
    for (const [Page, slug] of [[Service, "game-development"], [Portfolio, "eclipse"], [Blog, "studio-notes-july-update"]] as const) {
      await expect(Page({ params: Promise.resolve({ slug }) })).rejects.toThrow("NOT_FOUND");
    }
  });
});
