"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Counts a number up when scrolled into view. Instant when reduced motion. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1.8,
  className,
  format,
  keyDep,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  format?: (v: number) => string;
  /** change to re-render final value (e.g. language switch) */
  keyDep?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useUI((s) => s.reduced);

  const render = (v: number) => {
    if (format) return format(v);
    return (
      prefix +
      v.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix
    );
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = render(to);
      return;
    }
    const obj = { v: 0 };
    el.textContent = render(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: to,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = render(obj.v);
          },
        });
      },
    });
    return () => {
      st.kill();
    };
  }, [to, reduced, keyDep]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {render(to)}
    </span>
  );
}
