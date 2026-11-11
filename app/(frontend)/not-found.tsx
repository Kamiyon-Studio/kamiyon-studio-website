import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SameRouteLink } from "@/components/ui/SameRouteLink";
import { CONTACT_CTA } from "@/lib/config/navigation";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="studio-page-intro bg-[var(--bg-primary)]">
      <Container>
        <h1 className="studio-page-title">
          Page not found
        </h1>
        <p className="studio-lead mt-6">
          The page you are looking for may have moved or does not exist yet.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button href="/" variant="primary">
            Back to home
          </Button>
          <SameRouteLink
            href={CONTACT_CTA.href}
            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-sakura-ink focus-visible:outline-offset-2"
          >
            {CONTACT_CTA.label}
          </SameRouteLink>
        </div>
      </Container>
    </section>
  );
}
