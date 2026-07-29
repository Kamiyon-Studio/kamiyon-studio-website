import Link from "next/link";

import { cn } from "@/lib/utils";

export interface ImageSource {
  src: string;
  alt: string;
}

export interface RevealImageListItemProps {
  text: string;
  images: [ImageSource, ImageSource];
  /** Wrap as a Next.js Link when provided. */
  href?: string;
  className?: string;
  /**
   * When true, suppress images and interactivity. Use for the aria-hidden
   * marquee clone track to avoid duplicate focusable elements.
   */
  decorative?: boolean;
}

const imageSlot =
  "absolute right-8 -top-1 z-40 h-20 w-16";

const imageFrame =
  "relative h-16 w-16 scale-0 overflow-hidden rounded-md opacity-0 shadow-none transition-all delay-100 duration-500 group-hover:h-full group-hover:w-full group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-xl group-focus-within:h-full group-focus-within:w-full group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:shadow-xl";

/**
 * A single service row with a hover image-reveal effect.
 *
 * On hover/focus the text dims to 40% opacity and two layered images appear
 * at the right edge — the front image shifts + rotates away from the back.
 */
export function RevealImageListItem({
  text,
  images,
  href,
  className,
  decorative = false,
}: RevealImageListItemProps) {
  const [frontImage, backImage] = images;

  const rootClass = cn(
    "group relative h-fit w-fit overflow-visible py-8",
    className,
  );

  const textEl = (
    <span className="font-black transition-all duration-500 group-hover:opacity-40 group-focus-within:opacity-40">
      {text}
    </span>
  );

  // Image reveal: two stacked frames that scale in on group-hover/focus.
  // Container is aria-hidden so decorative images don't pollute the link name.
  const imageReveal = (
    <>
      <div aria-hidden="true" className={imageSlot}>
        <div className={imageFrame}>
          <img
            alt=""
            src={backImage.src}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          imageSlot,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12 group-focus-within:translate-x-6 group-focus-within:translate-y-6 group-focus-within:rotate-12",
        )}
      >
        <div className={cn(imageFrame, "duration-200")}>
          <img
            alt=""
            src={frontImage.src}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </>
  );

  if (decorative) {
    return <span className={rootClass}>{textEl}</span>;
  }

  if (href) {
    return (
      <Link href={href} className={rootClass}>
        {textEl}
        {imageReveal}
      </Link>
    );
  }

  return (
    <div className={rootClass}>
      {textEl}
      {imageReveal}
    </div>
  );
}
