import { Container } from "@/components/ui/Container";
import {
  ValuesHoverExpand,
  type ValuesHoverExpandItem,
} from "@/components/ui/values-expand-on-hover";
import type { CoreValue } from "@/lib/cms/types";

type ValuesGridProps = {
  values: CoreValue[];
};

type ValueImage = {
  imageSrc: string;
  imageAlt: string;
};

/** Frozen Unsplash crops keyed by slugified value name, chosen to evoke each value's intent. */
const VALUE_IMAGES: Record<string, ValueImage> = {
  curiosity: {
    imageSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80&auto=format&fit=crop",
    imageAlt: "A misty forest path winding into the distance, inviting exploration",
  },
  education: {
    imageSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80&auto=format&fit=crop",
    imageAlt: "A stack of open books on a wooden desk",
  },
  innovation: {
    imageSrc:
      "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&q=80&auto=format&fit=crop",
    imageAlt: "A modern glass building with striking geometric architecture",
  },
  accessibility: {
    imageSrc:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format&fit=crop",
    imageAlt: "A wide, open path through a sunlit green field",
  },
  "long-term-thinking": {
    imageSrc:
      "https://images.unsplash.com/photo-1499673610122-01c7122c5dcb?w=800&q=80&auto=format&fit=crop",
    imageAlt: "A wide horizon at sunset over calm water",
  },
};

const VALUE_IMAGE_FALLBACKS = Object.values(VALUE_IMAGES);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toValuesHoverExpandItems(values: CoreValue[]): ValuesHoverExpandItem[] {
  return values.map((value, index) => {
    const slug = slugify(value.name);
    const image =
      VALUE_IMAGES[slug] ?? VALUE_IMAGE_FALLBACKS[index % VALUE_IMAGE_FALLBACKS.length];

    return {
      id: slug ? `value-${slug}` : `value-${index}`,
      name: value.name,
      description: value.description,
      imageSrc: image.imageSrc,
      imageAlt: image.imageAlt,
    };
  });
}

export function ValuesGrid({ values }: ValuesGridProps) {
  const items = toValuesHoverExpandItems(values);

  return (
    <section id="values" className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container>
        <h2 className="text-center font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          What we value
        </h2>

        <div className="mt-10 flex justify-center">
          <ValuesHoverExpand items={items} />
        </div>
      </Container>
    </section>
  );
}
