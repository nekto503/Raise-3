"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SplitTitle } from "@/components/bits/SplitTitle";
import { WaitlistForm } from "@/components/bits/WaitlistForm";
import { SlideConfetti } from "@/components/bits/SlideConfetti";
import { Reveal } from "@/components/bits/Reveal";
import { useT } from "@/lib/i18n";
import { sp, useUI } from "@/lib/store";
import { playSfx } from "@/lib/sound";

export function FinalCta() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const ready = useUI((s) => s.ready);
  const sectionRef = useRef<HTMLElement>(null);
  const [confettiId, setConfettiId] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // drive sp.final for the 3D "everything collapses into the sphere" moment
  useEffect(() => {
    if (reduced || !sectionRef.current) return;
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: 1,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        sp.final = proxy.v;
      },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        end: "top 5%",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    // sync to the live scroll on mount (HMR remount / anchor jump safety)
    const st = tween.scrollTrigger;
    if (st) sp.final = st.progress;
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      sp.final = 0;
    };
  }, [reduced]);

  // auto-remove confetti
  useEffect(() => {
    if (!showConfetti) return;
    const id = window.setTimeout(() => setShowConfetti(false), 2200);
    return () => window.clearTimeout(id);
  }, [showConfetti]);

  return (
    <section id="cta" ref={sectionRef} className="relative overflow-hidden bg-paper py-32 md:py-44">
      {/* halo behind the glass sphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(126,200,242,0.4), rgba(255,179,217,0.3) 45%, rgba(185,163,232,0.25) 68%, transparent 78%)",
        }}
        aria-hidden="true"
      />

      <SlideConfetti fireId={showConfetti ? confettiId : 0} />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.p
          className="mono-label flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={ready || reduced ? { opacity: 1 } : undefined}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="size-3.5 text-marker" aria-hidden="true" />
          {"Raise 3 · waitlist"}
          <Sparkles className="size-3.5 text-marker" aria-hidden="true" />
        </motion.p>

        {/* the closing pitch never floats naked over the 3D sphere */}
        <div className="glass-liquid mx-auto mt-6 max-w-2xl rounded-[28px] px-6 py-8 text-center shadow-glass md:px-10 md:py-9">
          <SplitTitle
            as="h2"
            words={t.final.title}
            className="font-heading text-[clamp(2.2rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink"
          />
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl">{t.final.sub}</p>
        </div>

        <Reveal variant="zoom">
          <div className="mt-10 flex flex-col items-center">
            <WaitlistForm
              onDone={(ok) => {
                if (ok) {
                  setConfettiId((n) => n + 1);
                  setShowConfetti(true);
                } else {
                  playSfx("click");
                }
              }}
            />
          </div>
        </Reveal>

        <Reveal variant="wipe" delay={0.1} className="mt-6">
          <p className="text-center font-mono text-xs text-ink-2">{t.final.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
