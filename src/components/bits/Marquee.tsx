"use client";

import { cn } from "@/lib/utils";

/** Infinite marquee strip with mono labels and diamond separators. */
export function Marquee({
  items,
  className,
  itemClassName,
  dark = false,
  fast = false,
  ariaLabel,
}: {
  items: ReadonlyArray<string>;
  className?: string;
  itemClassName?: string;
  dark?: boolean;
  fast?: boolean;
  ariaLabel?: string;
}) {
  const row = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className={cn("flex items-center gap-10 whitespace-nowrap", itemClassName)}>
          {item}
          <span className={cn("inline-block size-[6px] rotate-45", dark ? "bg-white/40" : "bg-marker")} aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative flex w-full overflow-hidden", className)}
      aria-label={ariaLabel}
      role={ariaLabel ? "marquee" : undefined}
    >
      <div className={cn("flex w-max", fast ? "animate-marquee-fast" : "animate-marquee")}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
