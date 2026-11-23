"use client";

import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/bits/Logo";
import { LangSwitch } from "@/components/bits/LangSwitch";
import { useT } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { playSfx } from "@/lib/sound";

/**
 * The glass top panel: logo, section links, the RU/EN switch and the
 * subscription CTA — one floating bar of glass over the whole page.
 */
export function Header() {
  const t = useT();

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    playSfx("click");
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-4">
      <nav
        className="glass-topbar mx-auto flex w-full max-w-[1360px] items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 shadow-glass md:gap-3 md:pl-4"
        aria-label="Raise 3"
      >
        <a
          href="#hero"
          onClick={go("#hero")}
          className="flex shrink-0 items-center rounded-full pr-1 focus-visible:outline-2 focus-visible:outline-cobalt md:pr-2"
          aria-label="Raise 3 — home"
        >
          <Logo compact />
        </a>

        {/* section links — full navigation lives here since the dock is off */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {t.nav.pill.map((item) => (
            <a
              key={item.id}
              href={item.id}
              onClick={go(item.id)}
              className="rounded-full px-3.5 py-1.5 font-heading text-sm font-semibold text-ink/65 transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-cobalt"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex-1" aria-hidden="true" />

        {/* RU / EN — the translation switch lives right in the panel */}
        <LangSwitch compact />

        {/* the try CTA leads to the subscription purchase */}
        <a
          href="#pricing"
          onClick={go("#pricing")}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-heading text-sm font-bold text-white transition-all duration-300 hover:bg-cobalt hover:shadow-cobalt focus-visible:outline-2 focus-visible:outline-cobalt md:px-5 md:py-2"
        >
          {t.nav.try}
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </nav>
    </header>
  );
}
