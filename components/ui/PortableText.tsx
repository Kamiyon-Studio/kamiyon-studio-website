import Image from "next/image";
import type { ReactNode } from "react";
import { getCmsImageUrl } from "@/lib/cms/image";
import type { BlogBodyBlock, PortableTextBlock } from "@/lib/cms/types";

const TAGS = {
  normal: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  blockquote: "blockquote",
} as const;

function safeHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value, "https://kamiyonstudio.com");
    return ["https:", "http:", "mailto:"].includes(url.protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

function spans(block: PortableTextBlock): ReactNode {
  return block.children.map((span, index) => {
    let content: ReactNode = span.text;
    for (const mark of span.marks ?? []) {
      if (mark === "strong") content = <strong>{content}</strong>;
      else if (mark === "em") content = <em>{content}</em>;
      else {
        const definition = block.markDefs?.find(
          (entry) => entry._key === mark && entry._type === "link",
        );
        const href = safeHref(definition?.href);
        if (href)
          content = (
            <a href={href} className="underline underline-offset-4">
              {content}
            </a>
          );
      }
    }
    return <span key={index}>{content}</span>;
  });
}

function renderList(
  blocks: PortableTextBlock[],
  start: number,
  level: number,
): [ReactNode, number] {
  const kind = blocks[start].listItem;
  const Tag = kind === "number" ? "ol" : "ul";
  const items: ReactNode[] = [];
  let index = start;
  while (index < blocks.length && (blocks[index].level ?? 1) >= level) {
    const block = blocks[index];
    if ((block.level ?? 1) === level && block.listItem !== kind) break;
    const children: ReactNode[] = [spans(block)];
    index++;
    while (index < blocks.length && (blocks[index].level ?? 1) > level) {
      const [nested, next] = renderList(
        blocks,
        index,
        blocks[index].level ?? 1,
      );
      children.push(nested);
      index = next;
    }
    items.push(<li key={block._key ?? index}>{children}</li>);
  }
  return [
    <Tag
      key={`${start}-${level}`}
      className={`ml-6 space-y-2 ${kind === "number" ? "list-decimal" : "list-disc"}`}
    >
      {items}
    </Tag>,
    index,
  ];
}

export function PortableText({ blocks }: { blocks: BlogBodyBlock[] }) {
  const nodes: ReactNode[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (block._type === "inlineImage") {
      const src = getCmsImageUrl(block.asset);
      if (src)
        nodes.push(
          <figure key={block._key ?? index}>
            <div className="relative aspect-[3/2]">
              <Image
                src={src}
                alt={block.asset?.alt ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-contain"
              />
            </div>
            {block.asset?.caption ? (
              <figcaption className="mt-2 text-sm">
                {block.asset.caption}
              </figcaption>
            ) : null}
          </figure>,
        );
    } else if (block.listItem) {
      const group: PortableTextBlock[] = [block];
      while (index + 1 < blocks.length) {
        const next = blocks[index + 1];
        if (next._type !== "block" || !next.listItem) break;
        group.push(next);
        index++;
      }
      let cursor = 0;
      while (cursor < group.length) {
        const [list, next] = renderList(
          group,
          cursor,
          group[cursor].level ?? 1,
        );
        nodes.push(<div key={`list-${index}-${cursor}`}>{list}</div>);
        cursor = next;
      }
    } else {
      const Tag = TAGS[block.style as keyof typeof TAGS] ?? "p";
      nodes.push(
        <Tag
          key={block._key ?? index}
          className={
            Tag.startsWith("h")
              ? "font-display font-semibold text-[var(--text-primary)]"
              : undefined
          }
        >
          {spans(block)}
        </Tag>,
      );
    }
  }
  return (
    <div className="space-y-4 text-base text-[var(--text-secondary)]">
      {nodes}
    </div>
  );
}
