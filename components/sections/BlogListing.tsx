import Link from "next/link";

import { Container } from "@/components/ui/Container";
import type { Post } from "@/lib/cms/types";

type BlogListingProps = {
  posts: Post[];
};

function formatPublishedAt(publishedAt: string): string | null {
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogListing({ posts }: BlogListingProps) {
  const ordered = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <section className="bg-[var(--bg-primary)] pb-16 md:pb-24">
      <Container>
        <header className="studio-page-intro">
          <h1 className="studio-page-title">
            Blog
          </h1>
          <p className="studio-lead mt-6">
            Studio updates, announcements, and notes from Kamiyon Studio.
          </p>
        </header>

        {ordered.length > 0 ? (
          <ol className="mt-12 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
            {ordered.map((post) => {
              const dateLabel = formatPublishedAt(post.publishedAt);
              const href = `/blog/${post.slug.current}`;

              return (
                <li key={post.slug.current}>
                  <Link
                    href={href}
                    className="group flex flex-col gap-2 py-6 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
                      {post.title}
                    </h2>
                    {dateLabel ? (
                      <time
                        dateTime={post.publishedAt}
                        className="shrink-0 text-sm text-[var(--text-muted)]"
                      >
                        {dateLabel}
                      </time>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-10 text-base text-[var(--text-secondary)]">
            Posts coming soon.
          </p>
        )}
      </Container>
    </section>
  );
}
