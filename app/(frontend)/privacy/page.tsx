import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { PUBLIC_EMAIL } from "@/lib/contact/channels";

export const metadata = buildPageMetadata({
  title: "Contact privacy",
  description: "How inquiries sent through the Kamiyon Studio website are handled.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <article className="mx-auto max-w-2xl space-y-6 text-[var(--text-secondary)]">
          <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">Contact privacy</h1>
          <p>The contact form asks for your name, email address, and message so Kamiyon Studio can receive and respond to your inquiry. Please avoid including sensitive personal information in your message.</p>
          <h2 className="font-display text-2xl font-semibold">How your message reaches us</h2>
          <p>The website runs on Cloudflare. Form submissions are sent through Resend to the studio inbox, and a confirmation email is sent to the address you provide. Delivery logs may include request and email delivery identifiers.</p>
          <h2 className="font-display text-2xl font-semibold">Questions about your information</h2>
          <p>To ask about a message you submitted, including how long it is kept or to request its deletion, contact <a className="underline" href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>. Include enough detail to identify your inquiry without sending additional sensitive information.</p>
          <h2 className="font-display text-2xl font-semibold">Other contact channels</h2>
          <p>If you choose the external Google Form, email, or a social platform, your message is also handled by that service under its own privacy terms.</p>
        </article>
      </Container>
    </section>
  );
}
