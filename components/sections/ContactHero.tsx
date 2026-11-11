import Link from "next/link";
import { PageOpeningHero } from "./PageOpeningHero";
import type { ContactPage } from "@/lib/cms/types";

type ContactHeroProps = { contactPage: ContactPage; };

export function ContactHero({ contactPage }: ContactHeroProps) {
  const quickLinks = [
    { label: "Send a message", href: "#form" },
    { label: "Ways to reach us", href: "#methods" },
    ...(contactPage.faq.length > 0 ? [{ label: "FAQ", href: "#faq" }] : []),
  ];

  return (
    <PageOpeningHero id="contact-hero" title={contactPage.headline} ariaLabel="Contact" description={contactPage.intro}>
      <nav aria-label="Quick links" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center border-b border-[var(--border-default)] font-sans text-sm font-medium text-sakura-ink transition-colors hover:text-[var(--text-primary)]">
            {link.label}
          </Link>
        ))}
      </nav>
    </PageOpeningHero>
  );
}
