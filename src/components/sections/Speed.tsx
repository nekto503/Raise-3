"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Flag, Timer } from "lucide-react";
import { SectionHead } from "@/components/bits/SectionHead";
import { CountUp } from "@/components/bits/CountUp";
import { Reveal } from "@/components/bits/Reveal";
import { useT } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Speed() {
  const t = useT();
  return (
    <section id="speed" className="relative bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <SectionHead
          align="center"
          label={t.speed.label}
          title={t.speed.title}
          sub={t.speed.sub}
        />

        <div className="mt-16 space-y-10">
          <Reveal variant="zoom">
            <RaceLane
              name={t.speed.manual.name}
              note={t.speed.manual.note}
              time={t.speed.manual.time}
              seconds={14400}
              fillClass="bg-ink/15"
              slow
            />
          </Reveal>
          <Reveal variant="zoom" delay={0.1}>
            <RaceLane
              name={t.speed.raise.name}
              note={t.speed.raise.note}
              time={t.speed.raise.time}
              seconds={30}
              fillClass="bg-cobalt"
              winner
            />
          </Reveal>
        </div>

        <Reveal variant="zoom" className="mt-10">
          <p className="text-center">
            <span className="marker-hl font-heading text-xl font-extrabold md:text-2xl">{t.speed.verdict}</span>
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {t.speed.metrics.map((m, i) => (
            <Reveal key={m.label} variant="blur" delay={i * 0.12}>
              <div className="glass-liquid rounded-[24px] p-7 text-center shadow-glass">
                <p className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
                  <CountUp to={m.value} decimals={m.decimals} suffix={m.suffix} keyDep={t.speed.label} />
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-2">{m.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RaceLane({
  name,
  note,
  time,
  seconds,
  fillClass,
  slow = false,
  winner = false,
}: {
  name: string;
  note: string;
  time: string;
  seconds: number;
  fillClass: string;
  slow?: boolean;
  winner?: boolean;
}) {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(() => setDone(true), slow ? 2300 : 550);
    return () => window.clearTimeout(id);
  }, [inView, slow]);

  return (
    <div ref={ref}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-2">{name}</p>
          <p className={cn("mt-1 font-heading text-xl font-bold", winner ? "text-cobalt" : "text-ink")}>{note}</p>
        </div>
        <p className="text-right">
          <span className={cn("font-display text-3xl font-bold tabular-nums md:text-4xl", winner ? "text-cobalt" : "text-ink")}>
            <CountUp to={seconds} duration={slow ? 2.2 : 0.5} keyDep={name} />
          </span>{" "}
          <span className="font-mono text-xs text-ink-2">{t.speed.secondsLabel}</span>
          <span className={cn("ml-3 font-heading text-lg font-bold", done ? "text-ink" : "text-ink/20")}>{time}</span>
        </p>
      </div>
      <div
        className="relative mt-3 h-14 overflow-hidden rounded-2xl border border-ink/[0.07] bg-mist"
        role="img"
        aria-label={`${name}: ${time}`}
      >
        {/* finish flag */}
        <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-ink-2" aria-hidden="true">
          <Flag className={cn("size-4", winner && "text-cobalt")} />
        </span>
        {/* racing fill */}
        <div className="absolute inset-0 flex items-center px-2">
          <div
            className={cn("relative h-8 rounded-xl", fillClass, winner && "shadow-cobalt")}
            style={{
              width: reduced ? "calc(100% - 44px)" : inView ? "calc(100% - 44px)" : "0%",
              transitionDuration: slow ? "2300ms" : "650ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionProperty: "width",
            }}
          >
            <span className="absolute inset-y-0 right-0 flex items-center pr-2" aria-hidden="true">
              <Timer className={cn("size-3.5", winner ? "text-white" : "text-ink/40")} />
            </span>
          </div>
        </div>
        {!reduced && !inView && <motion.div className="absolute left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-xl bg-white/60" />}
      </div>
    </div>
  );
}
