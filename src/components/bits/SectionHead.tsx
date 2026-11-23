"use client";

import { SplitTitle } from "@/components/bits/SplitTitle";
import { cn } from "@/lib/utils";

/**
 * A section heading that never floats naked in the air —
 * always framed in a liquid-glass card.
 */
export function SectionHead({
  label,
  title,
  sub,
  align = "center",
  dark = false,
  className,
  titleClassName,
}: {
  label: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        dark ? "glass-liquid-dark" : "glass-liquid",
        "rounded-[28px] px-6 py-6 shadow-glass md:px-9 md:py-7",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl text-left",
        className
      )}
    >
      <p className={cn("mono-label", dark && "text-white/50")}>{label}</p>
      <SplitTitle
        as="h2"
        words={[{ text: title }]}
        className={cn(
          "mt-3 font-heading text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.03em]",
          dark ? "text-white" : "text-ink",
          titleClassName
        )}
      />
      {sub && (
        <p className={cn("mt-3 text-lg leading-relaxed", dark ? "text-white/70" : "text-ink-2")}>{sub}</p>
      )}
    </div>
  );
}
