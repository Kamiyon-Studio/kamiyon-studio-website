"use client";

import "./ScrollMarker.css";

export type ScrollMarkerItem = {
  label: string;
  pointer?: string;
};

export type ScrollMarkerProps = {
  items: readonly ScrollMarkerItem[];
  activeIndex: number;
  onItemClick?: (index: number, label: string) => void;
  ariaLabel?: string;
  className?: string;
};

export function ScrollMarker({
  items,
  activeIndex,
  onItemClick,
  ariaLabel = "Page sections",
  className = "",
}: ScrollMarkerProps) {
  return (
    <nav
      className={`scroll-marker-block${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const pointer = item.pointer ?? `pointer-${index + 1}`;

        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            className={`scroll-marker${isActive ? " is-active" : ""}`}
            data-label={item.label}
            data-pointer={pointer}
            aria-current={isActive ? "true" : "false"}
            onClick={() => onItemClick?.(index, item.label)}
          >
            <span className="scroll-marker__bar" aria-hidden="true" />
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
