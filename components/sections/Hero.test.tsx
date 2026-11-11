import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import { Hero, selectHeroProject } from "./Hero";

afterEach(() => vi.unstubAllEnvs());
const project = portfolioItemsFallback[0];

describe("Hero", () => {
  it.each([undefined, "https://media.kamiyonstudio.com"])(
    "keeps the opening static with media CDN %s",
    (baseUrl) => {
      vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", baseUrl);
      const { container } = render(<Hero project={project} />);
      expect(screen.getByRole("heading", { level: 1, name: "Games, digital products, and design." })).toBeInTheDocument();
      expect(container.querySelector('img[src*="background.avif"]')).toBeNull();
      expect(container.querySelector("video")).toBeNull();
      expect(container.querySelector('[data-testid="hero-parallax-stage"]')).toBeNull();
      expect(container.querySelector("[data-opening-curtain]")).toBeNull();
    },
  );
});

describe("selectHeroProject", () => {
  it("prefers featured real work with supported imagery", () => {
    const imageProject = { ...project, title: "Image project", coverImage: { url: "/project.jpg" } };
    const otherImage = { ...imageProject, title: "Other", featured: false };
    expect(selectHeroProject([project, otherImage, imageProject])).toBe(imageProject);
  });

  it("does not surface placeholders or fabricate work for empty content", () => {
    expect(selectHeroProject([])).toBeUndefined();
    expect(selectHeroProject([{ ...project, isPlaceholder: true, coverImage: { url: "/placeholder.jpg" } }])).toBeUndefined();
  });

  it("falls back to real text-only work when artwork is missing", () => {
    expect(selectHeroProject([project])).toBe(project);
  });

  it("recognizes supported gallery images without selecting an unsafe image host", () => {
    const unsafe = { ...project, coverImage: { url: "https://unsupported.example/x.jpg" } };
    const galleryProject = { ...project, gallery: [{ url: "/gallery.jpg" }], featured: false };
    expect(selectHeroProject([unsafe, galleryProject])).toBe(galleryProject);
  });
});
