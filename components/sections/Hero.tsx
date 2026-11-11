import { getCmsImageUrl } from "@/lib/cms/image";
import type { Portfolio } from "@/lib/cms/types";
import { HeroOpening } from "./HeroOpening";

export function selectHeroProject(projects: Portfolio[]): Portfolio | undefined {
  const realProjects = projects.filter((project) => !project.isPlaceholder);
  const projectsWithImages = realProjects.filter((project) =>
    [project.coverImage, ...project.gallery].some((image) => getCmsImageUrl(image)),
  );
  return projectsWithImages.find((project) => project.featured)
    ?? projectsWithImages[0]
    ?? realProjects.find((project) => project.featured)
    ?? realProjects[0];
}

export function Hero({ project }: { project?: Portfolio }) {
  return <HeroOpening project={project} />;
}
