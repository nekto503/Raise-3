"use client";

import { Send, Twitter, Youtube, Github, ArrowUp } from "lucide-react";
import { Logo } from "@/components/bits/Logo";
import { LangSwitch } from "@/components/bits/LangSwitch";
import { Marquee } from "@/components/bits/Marquee";
import { useT } from "@/lib/i18n";
import { scrollToId, scrollTop } from "@/lib/scroll";
import { playSfx } from "@/lib/sound";

const SOCIAL_ICONS: Record<string, typeof Send> = {
  telegram: Send,
  x: Twitter,
  youtube: Youtube,
  github: Github,
};

const ANCHORS: Record<string, string> = {
  "Демо": "#demo",
  "Demo": "#demo",
  "Стили": "#styles",
  "Styles": "#styles",
  "Тарифы": "#pricing",
  "Pricing": "#pricing",
  "API": "#business",
};

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    playSfx("click");
    scrollToId(id);
  };

  return (
    <footer className="mt-auto border-t border-ink/[0.07] bg-mist">
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">{t.footer.blurb}</p>
            <div className="mt-6 flex gap-3">
              {t.footer.socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.id] ?? Send;
                return (
                  <a
                    key={s.id}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    aria-label={s.aria}
                    className="flex size-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-cobalt/40 hover:text-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {[
            t.footer.product,
            t.footer.company,
            t.footer.legal,
          ].map((col) => (
            <div key={col.title}>
              <p className="mono-label">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href={ANCHORS[link] ?? "#"}
                      onClick={ANCHORS[link] ? go(ANCHORS[link]) : (e) => e.preventDefault()}
                      className="font-heading text-sm font-semibold text-ink/75 transition-colors hover:text-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink/[0.07] pt-6">
          <Marquee
            items={[t.footer.made, t.footer.rights, "PPTX · PDF · Google Slides", "30 sec", "32 lang"]}
            className="mb-8"
            itemClassName="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2/70"
          />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-mono text-xs text-ink-2">
              © {year} Raise 3 · {t.footer.rights}
            </p>
            <div className="flex items-center gap-4">
              <LangSwitch compact />
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  scrollTop();
                }}
                aria-label="Top"
                className="flex size-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink-2 transition-all duration-300 hover:-translate-y-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-cobalt"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
