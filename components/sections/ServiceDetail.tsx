import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PortableText } from "@/components/ui/PortableText";
import type { Service } from "@/lib/cms/types";
import { ServiceSidebar } from "./ServiceSidebar";

type ServiceDetailProps = {
  service: Service;
};

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <section className="bg-[var(--bg-primary)] pb-16 md:pb-24">
      <Container>
        <header className="studio-page-intro">
          {service.isPlaceholder ? (
            <Badge variant="placeholder" className="mt-4">
              Placeholder service
            </Badge>
          ) : null}

          <h1 className="studio-page-title">
            {service.title}
          </h1>
          {service.tagline ? (
            <p className="mt-2 text-base font-medium text-sakura-ink md:text-lg">
              {service.tagline}
            </p>
          ) : null}
          <p className="studio-lead mt-6">
            {service.summary}
          </p>

        </header>
        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <PortableText
              blocks={service.body.filter(
                (block) =>
                  block.children.map((child) => child.text).join("") !==
                  service.summary,
              )}
            />
            <section className="mt-10" aria-label="Related work">
              <h2 className="text-xl font-semibold">Explore our work</h2>
              <p className="mt-3">
                See the projects behind our studio&apos;s capabilities.
              </p>
              <Link
                href={
                  service.slug.current === "game-development"
                    ? "/portfolio/eclipse"
                    : "/portfolio"
                }
                className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4"
              >
                {service.slug.current === "game-development"
                  ? "Read the Eclipse case study"
                  : "Browse the portfolio"}
              </Link>
            </section>
          </div>
          <ServiceSidebar service={service} />
        </div>
      </Container>
    </section>
  );
}
