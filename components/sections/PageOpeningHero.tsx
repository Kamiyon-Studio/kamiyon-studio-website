import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export type PageOpeningHeroProps = {
  id: string;
  title: string;
  ariaLabel: string;
  description?: string;
  children?: ReactNode;
};

export function PageOpeningHero({
  id,
  title,
  ariaLabel,
  description,
  children,
}: PageOpeningHeroProps) {
  return (
    <section id={id} data-nav-theme="dark" className="studio-page-intro bg-[var(--bg-primary)]" aria-label={ariaLabel}>
      <Container>
        <h1 className="studio-page-title">{title}</h1>
        {description ? <p className="studio-lead mt-6">{description}</p> : null}
        {children}
      </Container>
    </section>
  );
}
