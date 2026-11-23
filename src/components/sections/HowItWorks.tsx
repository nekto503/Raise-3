"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { Mic, FileDown, Link as LinkIcon } from "lucide-react";
import { SectionHead } from "@/components/bits/SectionHead";
import { useT } from "@/lib/i18n";
import { sp, useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const screenRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !screenRef.current || !trackRef.current) return;
    const track = trackRef.current;
    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: screenRef.current,
        start: "top top",
        end: "+=2400",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          sp.how = self.progress;
        },
      },
    });
    // sync to the live scroll on mount (HMR remount / anchor jump safety)
    const st = tween.scrollTrigger;
    if (st) sp.how = st.progress;
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      sp.how = 0;
    };
  }, [reduced]);

  const d = t.how;

  return (
    <section id="how" className="relative bg-paper">
      {/* everything after the showpiece demo runs on the clean white page */}
      <div
        ref={screenRef}
        className={cn(
          "relative flex h-screen flex-col overflow-hidden",
          reduced && "h-auto min-h-screen"
        )}
      >
        {/* head — in the flow at the top so it can never overlap the steps below */}
        <div className="w-full shrink-0 px-6 pt-[84px] md:px-10 md:pt-[92px]">
          <SectionHead
            align="left"
            label={d.label}
            title={d.title}
            sub={d.sub}
            className="max-w-md rounded-[20px] px-5 py-4 md:px-6 md:py-4.5"
            titleClassName="text-2xl md:text-3xl"
          />
        </div>

        {/* the horizontal steps, centered in whatever space is left */}
        <div className="relative flex flex-1 items-center overflow-visible">
          <div
            ref={trackRef}
            className={cn(
              "flex w-max items-stretch gap-[4vw] px-[8vw] md:gap-[4vw] md:px-[13vw]",
              reduced && "w-auto flex-col px-6 py-16 md:px-10"
            )}
          >
            {d.steps.map((step, i) => (
              <article
                key={step.num}
                className={cn(
                  "relative flex w-[84vw] shrink-0 items-center md:w-[64vw]",
                  reduced && "w-full"
                )}
                aria-label={`${step.num} ${step.title}`}
              >
                {/* giant outlined number */}
                <span
                  className="text-outline font-heading text-[clamp(7rem,22vw,15rem)] font-extrabold leading-none opacity-[0.16] select-none"
                  aria-hidden="true"
                >
                  {step.num}
                </span>

                <div className="-ml-[9vw] flex flex-1 flex-col gap-6 md:-ml-[7vw]">
                  <span className="glass w-fit rounded-full px-3.5 py-1.5">
                    <p className="mono-label">{step.tag}</p>
                  </span>
                  <h3 className="font-heading text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
                    {step.title}
                  </h3>
                  <p className="max-w-sm text-lg leading-relaxed text-ink-2">{step.desc}</p>
                  <StepVisual i={i} reduced={reduced} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepVisual({ i, reduced }: { i: number; reduced: boolean }) {
  if (i === 0) {
    // 1 — describe: a living text document
    return (
      <div className="glass relative w-full max-w-md rounded-[24px] p-6 shadow-glass">
        <div className="space-y-3" aria-hidden="true">
          {[90, 76, 84].map((w, j) => (
            <motion.div
              key={j}
              className={cn("h-2 rounded-full", j === 1 ? "bg-ink/20" : "bg-ink/15")}
              style={{ width: `${w}%` }}
              animate={reduced ? undefined : { width: [`${w - 18}%`, `${w}%`, `${w - 18}%`] }}
              transition={{ duration: 3.4, repeat: Infinity, delay: j * 0.5, ease: "easeInOut" }}
            />
          ))}
          <div className="flex items-center gap-1.5 pt-1">
            <mark className="h-2 w-14 rounded-full" aria-hidden="true" />
            <span className="h-[1.2em] w-[3px] bg-cobalt animate-blink" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2 w-fit">
          <Mic className="size-3.5 text-cobalt" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">voice input</span>
        </div>
      </div>
    );
  }
  if (i === 1) {
    // 2 — pick a style: palette of glass balls
    const colors = ["bg-glow-sky", "bg-glow-pink", "bg-marker", "bg-glow-violet", "bg-ink"];
    return (
      <div className="glass relative flex w-full max-w-md items-center justify-between rounded-[24px] px-8 py-10 shadow-glass" aria-hidden="true">
        {colors.map((c, j) => (
          <motion.span
            key={c}
            className={cn("size-9 rounded-full border border-white/60 shadow-soft", c)}
            animate={reduced ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: j * 0.35, ease: "easeInOut" }}
          />
        ))}
      </div>
    );
  }
  // 3 — export: the slide flies into formats
  return (
    <div className="glass relative flex w-full max-w-md flex-col items-start gap-4 rounded-[24px] p-6 shadow-glass" aria-hidden="true">
      <motion.div
        className="aspect-video w-28 rounded-xl border border-ink/10 bg-gradient-to-br from-glow-sky/60 via-glow-pink/60 to-glow-violet/60 shadow-soft"
        animate={reduced ? undefined : { x: [0, 14, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex flex-wrap gap-2">
        {[
          { icon: FileDown, label: "PPTX" },
          { icon: FileDown, label: "PDF" },
          { icon: LinkIcon, label: "LINK" },
        ].map((f) => (
          <span key={f.label} className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
            <f.icon className="size-3.5 text-cobalt" />
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
