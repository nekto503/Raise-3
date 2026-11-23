"use client";

import { motion } from "framer-motion";
import {
  Home,
  Sparkles,
  ListOrdered,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  Volume2,
  VolumeX,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/core/dock";
import { useT } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { playSfx } from "@/lib/sound";

// icons match their tabs: generation demo, ordered steps, feature grid, pricing card, FAQ
const ICONS: Array<LucideIcon> = [Home, Sparkles, ListOrdered, LayoutGrid, CreditCard, HelpCircle];
// items hidden on the smallest screens to keep the dock compact
const HIDE_MOBILE = new Set([2, 3]);

/** Floating magnifying dock: quick navigation + sound / language controls. */
export function DockBar() {
  const t = useT();
  const ready = useUI((s) => s.ready);
  const reduced = useUI((s) => s.reduced);
  const sound = useUI((s) => s.sound);
  const setSound = useUI((s) => s.setSound);
  const lang = useUI((s) => s.lang);
  const setLang = useUI((s) => s.setLang);

  const go = (id: string) => () => {
    playSfx("click");
    scrollToId(id);
  };

  return (
    <motion.div
      className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40"
      style={{ x: "-50%" }}
      initial={reduced ? false : { y: 96, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.45 }}
    >
      <div className="pointer-events-auto">
        <Dock className="glass-liquid items-end gap-1.5 rounded-[24px] px-2 pb-2.5 pt-2 md:gap-2" ariaLabel={t.a11y.dockNav}>
          {t.dock.items.map((item, i) => {
            const Icon = ICONS[i] ?? Home;
            return (
              <DockItem
                key={item.id}
                onClick={go(item.id)}
                title={item.label}
                className={HIDE_MOBILE.has(i) ? "hidden sm:flex" : undefined}
              >
                <DockLabel>{item.label}</DockLabel>
                <DockIcon>
                  <Icon className="h-full w-full text-ink" aria-hidden="true" />
                </DockIcon>
              </DockItem>
            );
          })}

          <span className="mx-0.5 h-8 w-px self-center bg-ink/10 md:mx-1" aria-hidden="true" />

          <DockItem
            onClick={() => {
              playSfx("toggle");
              setSound(!sound);
            }}
            title={sound ? t.a11y.soundOff : t.a11y.soundOn}
            ariaLabel={sound ? t.a11y.soundOff : t.a11y.soundOn}
          >
            <DockLabel>{sound ? t.sound.off : t.sound.on}</DockLabel>
            <DockIcon>{sound ? <Volume2 className="h-full w-full text-ink" aria-hidden="true" /> : <VolumeX className="h-full w-full text-ink-2" aria-hidden="true" />}</DockIcon>
          </DockItem>

          <DockItem
            onClick={() => {
              playSfx("toggle");
              setLang(lang === "ru" ? "en" : "ru");
            }}
            title={t.a11y.langSwitch}
          >
            <DockLabel>{lang === "ru" ? "EN" : "RU"}</DockLabel>
            <DockIcon>
              <Languages className="h-full w-full text-ink" aria-hidden="true" />
            </DockIcon>
          </DockItem>
        </Dock>
      </div>
    </motion.div>
  );
}
