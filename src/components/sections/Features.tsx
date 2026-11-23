"use client";

import { motion } from "framer-motion";
import {
  Network,
  LayoutGrid,
  ChartColumn,
  ImagePlus,
  BookOpen,
  Mic,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SectionHead } from "@/components/bits/SectionHead";
import { TiltCard } from "@/components/bits/TiltCard";
import { BorderTrail } from "@/components/core/border-trail";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  network: Network,
  layout: LayoutGrid,
  chart: ChartColumn,
  image: ImagePlus,
  book: BookOpen,
  mic: Mic,
  users: Users,
};

const SPANS = [
  "sm:col-span-2 sm:row-span-2", // big feature
  "",
  "",
  "sm:col-span-2",
  "",
  "",
  "sm:col-span-2",
];

export function Features() {
  const t = useT();

  return (
    <section id="features" className="relative bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <SectionHead
          align="center"
          label={t.features.label}
          title={t.features.title}
          sub={t.features.sub}
        />

        <div className="mt-16 grid auto-rows-[minmax(190px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[item.icon] ?? Network;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 34, rotateX: -16 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: (i % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(SPANS[i], "[perspective:800px]")}
              >
                <TiltCard
                  max={6}
                  className="group relative h-full overflow-hidden rounded-[24px] border border-ink/[0.06] bg-white/70 p-6 shadow-glass backdrop-blur-sm transition-shadow duration-300 hover:shadow-lift md:p-7"
                >
                  <BorderTrail
                    size={70}
                    color={i % 2 === 0 ? "#FF5C8A" : "#2F5BFF"}
                    duration={4.2 + i * 0.3}
                    className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="flex size-11 items-center justify-center rounded-2xl border border-ink/[0.07] bg-white text-ink transition-all duration-300 group-hover:border-cobalt/30 group-hover:text-cobalt group-hover:shadow-cobalt/20">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className={cn("mt-auto", SPANS[i].includes("row-span-2") && "flex flex-1 flex-col")}>
                      <h3 className="font-heading text-xl font-bold tracking-tight text-ink md:text-2xl">{item.title}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">{item.desc}</p>
                      {i === 0 && (
                        <div className="mt-6 flex flex-1 flex-col justify-center gap-3" aria-hidden="true">
                          {["титул", "определение", "идеи", "финал"].map((step, j) => (
                            <motion.div
                              key={step}
                              className="flex items-center gap-3"
                              animate={{ opacity: [0.45, 1, 0.45] }}
                              transition={{ duration: 2.8, repeat: Infinity, delay: j * 0.7 }}
                            >
                              <span className="flex size-6 items-center justify-center rounded-full border border-ink/10 bg-white font-mono text-[9px] text-ink-2">
                                {j + 1}
                              </span>
                              <span className="h-px flex-1 bg-gradient-to-r from-cobalt/40 to-transparent" />
                              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{step}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      <MiniVisual i={i} />
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MiniVisual({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <div className="mt-5 flex flex-wrap items-center gap-1.5" aria-hidden="true">
          {["титул", "определение", "идеи", "финал"].map((chip, j) => (
            <span key={chip} className="flex items-center gap-1.5">
              <motion.span
                className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 font-mono text-[10px] text-ink-2"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: j * 0.6 }}
              >
                {chip}
              </motion.span>
              {j < 3 && <span className="text-ink-2/40">→</span>}
            </span>
          ))}
        </div>
      );
    case 1:
      return (
        <div className="mt-5 flex gap-2" aria-hidden="true">
          {["bg-white", "bg-ink", "bg-cobalt", "bg-marker", "bg-glow-pink"].map((c) => (
            <span key={c} className={cn("size-4 rounded-full border border-ink/10", c)} />
          ))}
        </div>
      );
    case 2:
      return (
        <div className="mt-5 flex h-12 items-end gap-1.5" aria-hidden="true">
          {[40, 65, 52, 84, 70, 95].map((v, j) => (
            <span
              key={j}
              style={{ height: `${v}%` }}
              className={cn("w-full rounded-t-md", j === 5 ? "bg-marker" : "bg-glow-sky")}
            />
          ))}
        </div>
      );
    case 3:
      return (
        <div className="mt-5 flex gap-3" aria-hidden="true">
          <span className="size-14 rounded-xl bg-glow-sky/60" />
          <span className="size-14 rounded-xl bg-glow-violet/60" />
        </div>
      );
    case 4:
      return (
        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          <span className="flex size-7 items-center justify-center rounded-full bg-ink font-heading text-[10px] font-bold text-white">R3</span>
          <span className="font-heading text-lg font-bold text-ink">Aa</span>
          <span className="font-mono text-sm italic text-ink-2">Ag</span>
        </div>
      );
    case 5:
      return (
        <div className="mt-5 flex h-10 items-center gap-1" aria-hidden="true">
          {Array.from({ length: 14 }, (_, j) => (
            <motion.span
              key={j}
              className="w-1 rounded-full bg-cobalt/60"
              animate={{ height: [6, 22 + ((j * 7) % 14), 6] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: j * 0.12, ease: "easeInOut" }}
            />
          ))}
        </div>
      );
    case 6:
      return (
        <div className="mt-5 flex items-center" aria-hidden="true">
          {["А", "M", "K", "Д"].map((l, j) => (
            <span
              key={l}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border-2 border-white font-heading text-xs font-bold text-white",
                ["bg-glow-sky", "bg-glow-pink", "bg-glow-violet", "bg-marker text-ink"][j]
              )}
              style={{ marginLeft: j === 0 ? 0 : -10 }}
            >
              {l}
            </span>
          ))}
          <span className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-white bg-ink font-mono text-xs text-white">
            +3
          </span>
        </div>
      );
    default:
      return null;
  }
}
