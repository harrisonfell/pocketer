import { cn } from "@/lib/utils";

/**
 * Pocketer mark — downward-pointing chevron in a rounded pocket.
 * NOTE: Placeholder drawn from the brandbook description until the
 * founder-provided SVG lands in /assets/brand/.
 * Safezone respected; no effects; brand colors only.
 */
export function LogoMark({
  size = 32,
  className,
  onDark = false,
}: {
  size?: number;
  className?: string;
  onDark?: boolean;
}) {
  const fill = onDark ? "#B0DBF8" : "#2C689A";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pocketer"
    >
      {/* pocket — rounded square */}
      <rect x="4" y="6" width="32" height="28" rx="10" fill={fill} />
      {/* chevron — downward V, centered, thick strokes */}
      <path
        d="M12.5 16.5 L20 24 L27.5 16.5"
        stroke={onDark ? "#102231" : "#FFFFFF"}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoLockup({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={26} onDark={onDark} />
      <span
        className={cn(
          "text-[15px] font-bold tracking-[0.12em]",
          onDark ? "text-snow" : "text-ink"
        )}
      >
        POCKETER
      </span>
    </div>
  );
}
