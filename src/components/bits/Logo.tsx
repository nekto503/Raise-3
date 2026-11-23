"use client";

import { cn } from "@/lib/utils";

/**
 * Minimal Raise 3 wordmark: three ascending bars (ink, ink, rose)
 * and a tight wordmark where the "3" carries the rose accent.
 */
export function Logo({ className, dark = false, compact = false }: { className?: string; dark?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", compact && "gap-2", className)}>
      <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <rect x="6" y="36" width="13" height="22" rx="4.5" fill={dark ? "#ffffff" : "#0A0A0A"} />
        <rect x="25.5" y="24" width="13" height="34" rx="4.5" fill={dark ? "#ffffff" : "#0A0A0A"} />
        <rect x="45" y="6" width="13" height="52" rx="4.5" fill="#FF5C8A" />
      </svg>
      <span
        className={cn(
          "font-display font-bold leading-none tracking-tight",
          compact ? "text-[15px]" : "text-[20px]",
          dark ? "text-white" : "text-ink"
        )}
      >
        Raise&nbsp;<span className="text-marker">3</span>
      </span>
    </span>
  );
}
