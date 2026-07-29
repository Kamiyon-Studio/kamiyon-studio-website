type BadgeVariant = "placeholder" | "info";

type BadgeProps = {
  children: string;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  placeholder:
    "border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)]",
  info: "border border-sakura/30 bg-[var(--bg-accent)] text-sakura-ink",
};

export function Badge({ children, variant = "placeholder", className = "" }: BadgeProps) {
  return (
    <span
      className={`badge inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
