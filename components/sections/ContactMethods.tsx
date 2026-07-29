import { ContactCard } from "@/components/ui/ContactCard";
import type { ContactChannel } from "@/lib/cms/types";

type ContactMethodsProps = {
  channels: ContactChannel[];
  ctaNote?: string;
};

export function ContactMethods({ channels, ctaNote }: ContactMethodsProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        Ways to reach us
      </h2>
      <p className="mt-3 max-w-[560px] text-sm text-[var(--text-secondary)] md:text-base">
        Prefer a channel you already use? Reach us directly through any of the
        options below — or use the message form on this page.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {channels.map((channel) => (
          <ContactCard key={channel.type} channel={channel} />
        ))}
      </div>

      {ctaNote ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">{ctaNote}</p>
      ) : null}
    </div>
  );
}
