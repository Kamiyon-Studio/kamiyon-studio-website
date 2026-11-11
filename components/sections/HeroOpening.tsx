import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { Portfolio } from "@/lib/cms/types";
import { SITE_MOTTO } from "@/lib/seo/constants";

export function HeroOpening({ project }: { project?: Portfolio }) {
  const preview = project && [project.coverImage, ...project.gallery].find((image) => getCmsImageUrl(image));
  const previewSrc = getCmsImageUrl(preview);
  const comparison = project?.gameplay?.dualStateTable;

  return (
    <section
      id="home-hero"
      data-nav-theme="dark"
      className="bg-[var(--bg-primary)] pb-12 pt-28 md:pb-20 md:pt-36"
      aria-label="Studio opening"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <p className="mb-6 font-display text-lg font-medium text-sakura">Kamiyon Studio</p>
            <h1 className="max-w-[13ch] font-display text-[clamp(2.75rem,5.4vw,4.5rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance text-[var(--text-primary)]">
              Games, digital products, and design.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              An independent Philippine studio. {SITE_MOTTO}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/portfolio">View our work</Button>
              <Button href="/contact" variant="secondary">Discuss a project</Button>
            </div>
          </div>
          {project ? (
            <article
              data-testid="hero-artwork"
              className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-ivory)] text-[var(--color-charcoal)]"
              aria-labelledby="hero-project-title"
            >
              {previewSrc ? (
                <div className="relative aspect-[16/10] bg-[var(--color-charcoal)]">
                  <Image
                    src={previewSrc}
                    alt={preview?.alt || `${project.title} project preview`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-contain"
                  />
                </div>
              ) : null}
              <div className="p-6 md:p-8">
                <p className="mb-3 text-sm font-medium text-[var(--color-charcoal)]/75">
                  {project.projectType === "original-ip" ? "Original IP" : "Client work"}
                </p>
                <h2 id="hero-project-title" className="font-display text-3xl leading-tight font-semibold tracking-[-0.025em] md:text-4xl">
                  {project.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-charcoal)]/80">
                  {project.positioning || project.shortDescription}
                </p>
                {!previewSrc && comparison && comparison.rows.length > 0 ? (
                  <table className="mt-6 w-full table-fixed border-collapse text-left text-sm">
                    <caption className="sr-only">{project.title} gameplay comparison</caption>
                    <thead>
                      <tr className="border-b border-[var(--color-charcoal)]/20">
                        <th className="pb-3 pr-2"><span className="sr-only">Aspect</span></th>
                        <th className="pb-3 pr-2">{comparison.leftLabel}</th>
                        <th className="pb-3">{comparison.rightLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.rows.slice(0, 3).map((row) => (
                        <tr key={row._key || row.aspect} className="border-b border-[var(--color-charcoal)]/15 align-top">
                          <th className="py-3 pr-2 font-medium">{row.aspect}</th>
                          <td className="py-3 pr-2 break-words">{row.left}</td>
                          <td className="py-3 break-words">{row.right}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
                <Link href={`/portfolio/${project.slug.current}`} className="mt-5 inline-flex min-h-11 items-center font-display font-medium text-[var(--color-charcoal)] underline decoration-[var(--color-sakura)] decoration-2 underline-offset-8 hover:decoration-[var(--color-charcoal)] focus-visible:outline-[var(--color-charcoal)]">
                  Read the {project.title} case study
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
