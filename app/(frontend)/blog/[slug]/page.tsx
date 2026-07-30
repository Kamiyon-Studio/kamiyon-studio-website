import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { PortableText } from "@/components/ui/PortableText";
import { postsFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getPostBySlug, getPosts } from "@/lib/cms/queries";
import type { PortableTextBlock, Post } from "@/lib/cms/types";
import { buildPageMetadata } from "@/lib/seo/metadata";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function resolvePost(slug: string, cmsPost: Post | null): Post | null {
  if (cmsPost) {
    return cmsPost;
  }

  return postsFallback.find((post) => post.slug.current === slug) ?? null;
}

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

export async function generateStaticParams() {
  const posts = resolveWithFallback(await getPosts(), postsFallback);
  return posts.map((post) => ({ slug: post.slug.current }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = resolvePost(slug, await getPostBySlug(slug));

  if (!post) {
    return buildPageMetadata({
      title: "Post not found",
      description: "This blog post could not be found.",
      path: `/blog/${slug}`,
    });
  }

  return buildPageMetadata({
    title: post.seo.title || post.title,
    description: post.seo.description,
    path: `/blog/${post.slug.current}`,
    noIndex: post.seo.noIndex,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = resolvePost(slug, await getPostBySlug(slug));

  if (!post) {
    notFound();
  }

  const dateLabel = formatPublishedAt(post.publishedAt);
  const bodyBlocks = post.body.filter(
    (block): block is PortableTextBlock => block._type === "block",
  );

  return (
    <article className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-[680px]">
          {dateLabel ? (
            <time
              dateTime={post.publishedAt}
              className="text-sm text-[var(--text-muted)]"
            >
              {dateLabel}
            </time>
          ) : null}
          <h1 className="mt-3 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            {post.title}
          </h1>
          {post.authors[0]?.name ? (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {post.authors[0].name}
            </p>
          ) : null}
          <div className="mt-10">
            <PortableText blocks={bodyBlocks} />
          </div>
        </div>
      </Container>
    </article>
  );
}
