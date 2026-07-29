import type { Metadata } from "next";

import { ContactFAQ } from "@/components/sections/ContactFAQ";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactHero } from "@/components/sections/ContactHero";
import { ContactMethods } from "@/components/sections/ContactMethods";
import { ContactSidebar } from "@/components/sections/ContactSidebar";
import { Container } from "@/components/ui/Container";
import { contactPageFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getContactPage } from "@/lib/cms/queries";
import { getFaqJsonLd } from "@/lib/seo/faq-jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

async function getContactContent() {
  const cmsContactPage = await getContactPage();

  return resolveWithFallback(cmsContactPage, contactPageFallback);
}

export async function generateMetadata(): Promise<Metadata> {
  const contactPage = await getContactContent();

  return buildPageMetadata({
    title: contactPage.seo.title,
    description: contactPage.seo.description,
    path: "/contact",
    ogImage: contactPage.seo.ogImage,
    noIndex: contactPage.seo.noIndex,
  });
}

export default async function ContactPage() {
  const contactPage = await getContactContent();
  const faqJsonLd =
    contactPage.faq.length > 0 ? getFaqJsonLd(contactPage.faq) : null;

  return (
    <>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <ContactHero contactPage={contactPage} />
      <section id="form" className="bg-[var(--bg-primary)] py-16 md:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <ContactForm />
            <ContactSidebar />
          </div>
        </Container>
      </section>
      <section id="methods" className="bg-[var(--bg-secondary)] py-16 md:py-24">
        <Container>
          <ContactMethods
            channels={contactPage.channels}
            ctaNote={contactPage.ctaNote}
          />
        </Container>
      </section>
      <ContactFAQ faq={contactPage.faq} />
    </>
  );
}
