"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["#hero", "#demo", "#how", "#features", "#styles", "#speed", "#cases", "#business", "#pricing", "#faq", "#cta"];

/** Side dot navigation with tooltips (desktop only). */
export function SideNav() {
  const t = useT();
  const [active, setActive] = useState("#hero");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.querySelector(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      aria-label={t.a11y.navDots}
    >
      {SECTION_IDS.map((id, i) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollToId(id)}
            className="group flex items-center gap-2.5 py-0.5"
            aria-label={t.nav.dots[i]}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:opacity-100",
                isActive ? "text-ink" : "text-ink-2"
              )}
            >
              {t.nav.dots[i]}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-400",
                isActive ? "h-2.5 w-6 bg-marker shadow-marker" : "size-2 bg-ink/20 group-hover:bg-ink/40"
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            />
          </button>
        );
      })}
    </nav>
  );
}
