"use client";

import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sound";
import { useT, type Lang } from "@/lib/i18n";
import { useUI } from "@/lib/store";

/** Segmented RU / EN switch — no page reload, everything re-renders from dictionaries. */
export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);

  const pick = (l: Lang) => {
    if (l === lang) return;
    playSfx("toggle");
    setLang(l);
  };

  return (
    <div
      role="group"
      aria-label={t.a11y.langSwitch}
      className={cn("flex items-center rounded-full border border-ink/10 bg-white/60 p-0.5 backdrop-blur", compact && "text-[10px]")}
    >
      {(["ru", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest transition-all duration-300",
            lang === l ? "bg-ink text-white shadow-soft" : "text-ink-2 hover:text-ink"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
