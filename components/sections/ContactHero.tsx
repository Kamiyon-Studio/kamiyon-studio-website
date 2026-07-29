import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { ContactPage } from "@/lib/cms/types";

type ContactHeroProps = {
  contactPage: ContactPage;
};

export function ContactHero({ contactPage }: ContactHeroProps) {
  const quickLinks = [
    { label: "Send a message", href: "#form" },
    { label: "Ways to reach us", href: "#methods" },
    ...(contactPage.faq.length > 0
      ? [{ label: "FAQ", href: "#faq" }]
      : []),
  ];

  return (
    <section className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container className="mx-auto max-w-[820px] text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-sakura-ink">
          Contact
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold text-[var(--text-primary)] md:text-5xl">
          {contactPage.headline}
        </h1>
        <p className="mt-6 text-base text-[var(--text-secondary)] md:text-lg">
          {contactPage.intro}
        </p>

        <nav
          aria-label="Quick links"
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-sakura-ink focus-visible:outline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
