"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, ChevronDown, Timer, FileOutput } from "lucide-react";
import { SplitTitle } from "@/components/bits/SplitTitle";
import { MagneticWrap } from "@/components/bits/MagneticWrap";
import { useT } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { playSfx } from "@/lib/sound";

export function Hero() {
  const t = useT();
  const ready = useUI((s) => s.ready);

  const go = (id: string) => () => {
    playSfx("click");
    scrollToId(id);
  };

  /** revealed only once the preloader lifts */
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 26 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section id="hero" data-canvas className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* ——— separation: a white "stage" halo lifts the copy off the 3D background ——— */}
      <div
        className="pointer-events-none absolute left-1/2 top-[47%] h-[56rem] w-[min(118vw,66rem)] -translate-x-1/2 -translate-y-1/2 rounded-[100%]"
        style={{
          background:
            "radial-gradient(closest-side, rgb(255 255 255 / 0.98), rgb(255 255 255 / 0.88) 48%, rgb(255 255 255 / 0.5) 70%, transparent 86%)",
        }}
        aria-hidden="true"
      />
      {/* faint hairline frame keeps the "stage" edge visible */}
      <div
        className="pointer-events-none absolute inset-x-[6vw] top-[16vh] hidden h-[52vh] rounded-[100%/120%] border-t border-ink/[0.06] md:block"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center sm:pb-20 sm:pt-28 [@media(max-height:700px)]:pb-12 [@media(max-height:700px)]:pt-20">
        <motion.div {...reveal(0.28)}>
          <p className="glass-liquid inline-flex items-center gap-2.5 rounded-full px-4 py-1.5">
            <span className="accent-dot" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-2">{t.hero.kicker}</span>
          </p>
        </motion.div>

        <SplitTitle
          as="h1"
          gate="ready"
          words={t.hero.title}
          className="mt-5 px-2 font-heading text-[clamp(2.7rem,8.6vw,8.6rem)] font-extrabold leading-[0.96] tracking-[-0.035em] text-ink [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:text-[clamp(2.2rem,5.4vw,4.2rem)]"
        />

        <motion.p
          className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-ink-2 md:text-xl [@media(max-height:700px)]:mt-4 [@media(max-height:700px)]:max-w-2xl [@media(max-height:700px)]:text-base"
          {...reveal(0.55)}
        >
          {t.hero.sub}
        </motion.p>

        <motion.div className="mt-8 flex w-full max-w-md flex-col items-center gap-4 sm:w-auto sm:flex-row [@media(max-height:700px)]:mt-5" {...reveal(0.72)}>
          <MagneticWrap className="w-full sm:w-auto">
            <button
              type="button"
              onClick={go("#pricing")}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-cobalt px-8 py-4 font-heading text-base font-bold text-white shadow-cobalt transition-all duration-300 hover:-translate-y-1 hover:bg-cobalt-deep focus-visible:outline-2 focus-visible:outline-cobalt sm:w-auto"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
            </button>
          </MagneticWrap>
          <button
            type="button"
            onClick={go("#how")}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/10 bg-white/60 px-7 py-4 font-heading text-base font-bold text-ink backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-glass focus-visible:outline-2 focus-visible:outline-cobalt sm:w-auto"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors duration-300 group-hover:bg-cobalt">
              <Play className="size-3.5 fill-current" aria-hidden="true" />
            </span>
            {t.hero.ctaSecondary}
          </button>
        </motion.div>
      </div>

      {/* floating accent chips flanking the headline */}
      <motion.div
        className="absolute left-[6%] top-[58%] hidden lg:block"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 0.9 }}
      >
        <div className="glass-liquid flex -rotate-3 animate-float-slow items-center gap-2.5 rounded-2xl px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt" aria-hidden="true">
            <Timer className="size-4" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">{t.hero.chipLeft}</span>
        </div>
      </motion.div>
      <motion.div
        className="absolute right-[6%] top-[17%] hidden lg:block"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.05 }}
      >
        <div
          className="glass-liquid flex rotate-2 animate-float-slow items-center gap-2.5 rounded-2xl px-4 py-3"
          style={{ animationDelay: "-3.2s" }}
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-marker/15 text-ink" aria-hidden="true">
            <FileOutput className="size-4" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">{t.hero.chipRight}</span>
        </div>
      </motion.div>

      {/* bottom bar: mono captions + scroll hint */}
      <motion.div
        className="relative mx-auto flex w-full max-w-[1440px] items-end justify-between px-6 pb-6 md:px-10 [@media(max-height:660px)]:hidden"
        {...reveal(0.95)}
      >
        <p className="mono-label hidden md:block">
          <span className="glass rounded-full px-3.5 py-1.5">{t.hero.monoLeft}</span>
        </p>
        <button
          type="button"
          onClick={go("#demo")}
          className="group flex flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-cobalt"
          aria-label={t.a11y.scrollDown}
        >
          <span className="mono-label">{t.hero.scroll}</span>
          <motion.span
            animate={ready ? { y: [0, 8, 0] } : undefined}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-5 text-ink" aria-hidden="true" />
          </motion.span>
        </button>
        <p className="mono-label hidden md:block">
          <span className="glass rounded-full px-3.5 py-1.5">{t.hero.monoRight}</span>
        </p>
      </motion.div>
    </section>
  );
}
