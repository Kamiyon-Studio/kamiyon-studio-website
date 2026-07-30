import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * Laurel geometry, traced from the reference badge.
 *
 * Each branch is an arc of a circle centred at (CX, CY) in the SVG's own
 * coordinate space. Leaves alternate outer/inner along the arc and all lean
 * toward the branch tip, which is what gives a laurel its feathered look.
 */
const CX = 143.2;
const CY = 153.0;

/** [ angle°, radius, tipDirection°, length, width ] */
type LeafSpec = readonly [number, number, number, number, number];

const LEAVES: readonly LeafSpec[] = [
  [124.0, 97.5, 60.5, 28.8, 8.9],
  [133.2, 84.5, 10.3, 25.2, 10.1],
  [141.0, 97.9, 76.2, 30.6, 8.3],
  [149.9, 85.1, 36.4, 27.6, 9.3],
  [159.5, 96.5, 90.7, 30.8, 8.3],
  [170.5, 85.0, 59.0, 29.5, 8.7],
  [182.9, 97.2, 114.8, 29.7, 8.7],
  [191.2, 85.5, 78.1, 30.6, 8.3],
  [202.5, 98.7, 136.3, 27.4, 9.3],
  [209.3, 86.9, 97.6, 31.2, 8.0],
  [221.4, 99.8, 161.4, 25.7, 10.0],
  [223.7, 86.1, 109.9, 29.5, 8.6],
  [234.4, 99.7, 185.5, 25.2, 10.4],
  [239.1, 84.0, 127.2, 28.1, 9.1],
  [247.9, 98.9, 203.1, 25.5, 10.1],
  [255.8, 85.0, 140.8, 27.3, 9.5],
];

/** Bare stem that curls out from under the lowest leaves. */
const STEM = "M 122 236 C 132 250, 144 262, 160 281";

/** Tight bounding box of the branch above, plus a little air. */
const VIEW_BOX = "36 56 128 230";

/** Two mirrored quadratic curves from leaf base to tip. */
export function buildLeafPath([th, r, dir, len, wid]: LeafSpec): string {
  const t = (th * Math.PI) / 180;
  const cx = CX + r * Math.cos(t);
  const cy = CY - r * Math.sin(t);

  const d = (dir * Math.PI) / 180;
  const ux = Math.cos(d);
  const uy = -Math.sin(d);
  const px = -uy;
  const py = ux;

  const bx = cx - (ux * len) / 2;
  const by = cy - (uy * len) / 2;
  const tx = cx + (ux * len) / 2;
  const ty = cy + (uy * len) / 2;

  return (
    `M ${bx.toFixed(1)} ${by.toFixed(1)} ` +
    `Q ${(cx + px * wid).toFixed(1)} ${(cy + py * wid).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} ` +
    `Q ${(cx - px * wid).toFixed(1)} ${(cy - py * wid).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} Z`
  );
}

/** Geometry is static — resolve once at module load so SSR and hydration match. */
export const LAUREL_LEAF_PATHS: readonly string[] = LEAVES.map(buildLeafPath);

/** Splits on real newlines and on the literal `\n` editors type into CMS fields. */
export function toLines(value: string): string[] {
  return String(value)
    .split(/\r?\n|\\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto w-full fill-current", flip && "-scale-x-100")}
    >
      {LAUREL_LEAF_PATHS.map((d, index) => (
        <path key={index} d={d} />
      ))}
      <path
        d={STEM}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type LaurelBadgeProps = {
  /** Recognition tier, e.g. "Winner", "Finalist", "Official Selection". */
  label?: string;
  /** Award name. Newlines split into balanced display lines. */
  title: string;
  /** Awarding body. Newlines split into balanced display lines. */
  organization?: string;
  /** Rendered beside the label as "WINNER · 2026". */
  year?: string;
  /** Marks the entry as an unfilled slot rather than a real accolade. */
  isPlaceholder?: boolean;
  className?: string;
};

/**
 * Laurel wreath accolade badge.
 *
 * Type scale is container-query driven (`cqw`), so the whole badge scales with
 * its column width rather than the viewport — one component works in a
 * three-up grid and as a single wide feature.
 */
export function LaurelBadge({
  label,
  title,
  organization,
  year,
  isPlaceholder = false,
  className,
}: LaurelBadgeProps) {
  const eyebrow = [label, year].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "@container flex aspect-[46/34] w-full items-center",
        isPlaceholder && "opacity-70",
        className,
      )}
    >
      <div className="flex w-full items-center">
        <div className="ml-[8.6%] flex-[0_0_26%] text-[var(--accent-premium)]/70">
          <Laurel />
        </div>

        <div className="mx-[-8%] flex min-w-0 flex-1 flex-col items-center gap-[6.5cqw] text-center">
          {eyebrow ? (
            <p className="whitespace-nowrap text-[3.3cqw] font-medium uppercase leading-none tracking-[0.42em] text-[var(--accent-premium)] [text-indent:0.42em]">
              {eyebrow}
            </p>
          ) : null}

          <p className="font-display text-[6.6cqw] font-bold uppercase leading-[1.12] tracking-[0.04em] text-[var(--text-primary)] [text-indent:0.04em]">
            {toLines(title).map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </p>

          {organization ? (
            <p className="text-[3.7cqw] font-bold uppercase leading-[1.35] tracking-[0.15em] text-[var(--text-secondary)] [text-indent:0.15em]">
              {toLines(organization).map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </p>
          ) : null}

          {isPlaceholder ? (
            <Badge>Placeholder</Badge>
          ) : (
            <span
              aria-hidden="true"
              className="h-[0.33cqw] w-[9.5cqw] bg-[var(--accent-premium)]/60"
            />
          )}
        </div>

        <div className="mr-[8.6%] flex-[0_0_26%] text-[var(--accent-premium)]/70">
          <Laurel flip />
        </div>
      </div>
    </div>
  );
}
