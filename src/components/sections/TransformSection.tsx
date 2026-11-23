"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Check,
  CornerDownLeft,
  Loader2,
  Lock,
  RotateCcw,
  X,
} from "lucide-react";
import { SplitTitle } from "@/components/bits/SplitTitle";
import { BorderTrail } from "@/components/core/border-trail";
import { useT } from "@/lib/i18n";
import { sp, useUI } from "@/lib/store";
import { easeInOut, seg } from "@/lib/anim";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** true pixel size of each restored long master — reserves the exact box */
const SLIDE_DIMS: Record<string, [number, number]> = {
  s1: [1600, 601],
  s2: [1600, 604],
  s3: [1600, 579],
  s4: [1600, 582],
  s5: [1600, 645],
  s6: [1600, 482],
};
const dim = (img: string): [number, number] => SLIDE_DIMS[img] ?? [1600, 600];

/** Builds the typed prompt HTML up to n chars with rose marks on keywords. */
function buildTypedHTML(text: string, highlights: ReadonlyArray<string>, n: number): string {
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(re);
  let count = 0;
  let html = "";
  for (const part of parts) {
    const isHl = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
    const take = Math.max(0, Math.min(part.length, n - count));
    const chunk = escapeHtml(part.slice(0, take));
    html += isHl ? `<mark>${chunk}</mark>` : chunk;
    count += take;
    if (count >= n) break;
  }
  return html;
}

export function TransformSection() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);

  const wrapRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const monoRef = useRef<HTMLParagraphElement>(null);
  const proxy = useRef({ v: 0 });

  const [phase, setPhase] = useState(0);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    if (reduced) {
      sp.transform = 1; // static "done" composition behind the section
      return;
    }

    const render = () => {
      const p = proxy.current.v;
      const d = tRef.current.transform;
      sp.transform = p;

      // — typing —
      const full = d.prompt;
      const typedN = Math.floor(seg(p, 0.03, 0.2) * full.length);
      if (textRef.current) {
        textRef.current.innerHTML = buildTypedHTML(full, d.promptHighlights, typedN);
      }
      if (caretRef.current) {
        caretRef.current.style.opacity = typedN < full.length && p > 0.02 ? "1" : "0";
      }

      // — the window dissolves while the query chip flies into the network —
      const dis = easeInOut(seg(p, 0.22, 0.32));
      if (winRef.current) {
        winRef.current.style.opacity = String(1 - dis);
        winRef.current.style.transform = `translateY(${dis * -7}%) scale(${1 - dis * 0.08})`;
        winRef.current.style.filter = `blur(${dis * 10}px)`;
        winRef.current.style.visibility = dis > 0.98 ? "hidden" : "visible";
      }

      // — the finished query lifts out of the window and flies into the core —
      const q = easeInOut(seg(p, 0.22, 0.33));
      if (flyRef.current) {
        const y = 8 - q * 15.5; // vh: window body -> the neural core above center
        const sc = 1 - q * 0.76;
        const op = q <= 0 ? 0 : 1 - easeInOut(seg(p, 0.3, 0.335));
        flyRef.current.style.opacity = String(op);
        flyRef.current.style.transform = `translate(-50%, -50%) translateY(${y}vh) scale(${Math.max(sc, 0.001)})`;
        flyRef.current.style.visibility = q > 0 && op > 0.01 ? "visible" : "hidden";
      }

      // — assembled chip: appears once the files have circled back in —
      const wc = easeInOut(seg(p, 0.92, 0.98));
      if (finaleRef.current) {
        finaleRef.current.style.opacity = String(wc);
        finaleRef.current.style.transform = `translateY(${(1 - wc) * 10}px) scale(${0.94 + wc * 0.06})`;
      }

      // — mono caption under the chip at the very end —
      const fin = seg(p, 0.97, 1);
      if (monoRef.current) {
        monoRef.current.style.opacity = String(fin);
      }

      // — css halo behind the core —
      if (blobRef.current) {
        blobRef.current.style.opacity = String(0.12 + 0.5 * Math.sin(Math.PI * seg(p, 0.12, 0.85)) + 0.12 * fin);
      }

      // — phase indicator —
      const ph = p < 0.22 ? 0 : p < 0.38 ? 1 : p < 0.82 ? 2 : 3;
      setPhase((prev) => (prev === ph ? prev : ph));
    };

    const tween = gsap.to(proxy.current, {
      v: 1,
      ease: "none",
      duration: 1,
      onUpdate: render,
      scrollTrigger: {
        trigger: screenRef.current,
        start: "top top",
        end: "+=4600",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // sync to the live scroll position on mount — after HMR remounts or anchor
    // jumps the section may already be fully scrolled past
    const st = tween.scrollTrigger;
    if (st && st.progress > 0) {
      proxy.current.v = st.progress;
      render();
    } else {
      render();
    }

    // rebuild typed text if the language flips mid-pin
    const unsub = useUI.subscribe((state, prev) => {
      if (state.lang !== prev.lang) render();
    });

    return () => {
      unsub();
      tween.scrollTrigger?.kill();
      tween.kill();
      sp.transform = 0;
    };
  }, [reduced]);

  const d = t.transform;

  return (
    <section id="demo" ref={wrapRef} className="relative">
      {/* ——— pinned showpiece screen (the only place left where the 3D canvas shows) ——— */}
      <div
        ref={screenRef}
        data-canvas
        className="relative flex h-screen items-center justify-center overflow-hidden pt-[min(200px,26vh)] pb-[min(140px,19vh)]"
      >
        {/* halo */}
        <div
          ref={blobRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[90px]"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(126,200,242,0.5), rgba(255,179,217,0.35) 45%, rgba(185,163,232,0.28) 70%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* header — glass card so the copy never floats naked over the 3D scene */}
        <div className="absolute inset-x-0 top-[84px] flex justify-start px-6 md:px-10">
          <div className="glass-liquid max-w-md rounded-[20px] px-5 py-4 shadow-glass md:px-6 md:py-4.5">
            <p className="mono-label">{d.label}</p>
            <SplitTitle
              as="h2"
              words={d.title}
              className="mt-1.5 font-heading text-xl font-extrabold tracking-tight text-ink md:text-2xl"
            />
          </div>
        </div>

        {/* the prompt window (typing -> dissolving) */}
        <div
          ref={winRef}
          className="glass relative z-10 w-[min(92vw,620px)] rounded-[24px] p-6 shadow-glass md:p-8"
          style={{ opacity: reduced ? 0 : 1 }}
        >
          <div className="flex items-center justify-between border-b border-ink/[0.07] pb-4">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-marker" />
              <span className="size-2.5 rounded-full bg-glow-pink" />
              <span className="size-2.5 rounded-full bg-glow-sky" />
            </div>
            <span className="font-mono text-xs text-ink-2">{d.windowTitle}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2/60">input</span>
          </div>
          <p className="min-h-[6.5rem] pt-5 text-lg font-medium leading-relaxed text-ink md:min-h-[8rem] md:text-2xl md:leading-relaxed">
            <span ref={textRef} className={reduced ? "" : "opacity-95"}>
              {reduced ? buildTypedHTML(d.prompt, d.promptHighlights, d.prompt.length) : ""}
            </span>
            <span
              ref={caretRef}
              className="ml-0.5 inline-block h-[1.15em] w-[3px] translate-y-[0.22em] bg-cobalt animate-blink"
              style={{ opacity: reduced ? 1 : 0 }}
              aria-hidden="true"
            />
          </p>
        </div>

        {/* the query chip — detaches from the window and flies into the neural core */}
        <div
          ref={flyRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[8]"
          style={{ opacity: 0, visibility: "hidden" }}
          aria-hidden="true"
        >
          <div className="glass-liquid flex max-w-[min(80vw,520px)] items-center gap-2.5 rounded-full px-5 py-2.5 shadow-glass">
            <Sparkles className="size-3.5 shrink-0 text-cobalt" aria-hidden="true" />
            <span className="truncate font-mono text-xs text-ink">{d.prompt}</span>
          </div>
        </div>

        {/* annotations were retired with the fan — the 3D showpiece now tells the story */}

        {/* assembled chip: the deck has circled back into the core */}
        <div
          ref={finaleRef}
          className="absolute bottom-[8.5rem] z-10 flex flex-col items-center gap-2.5"
          style={{ opacity: reduced ? 1 : 0 }}
        >
          <div className="glass-liquid flex items-center gap-3 rounded-full px-5 py-2.5 shadow-glass">
            <span className="flex size-5 items-center justify-center rounded-full bg-cobalt text-white" aria-hidden="true">
              <Check className="size-3" />
            </span>
            <span className="font-heading text-sm font-bold text-ink">{d.assembled}</span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-marker" />
              ))}
            </span>
          </div>
          <p ref={monoRef} className="font-mono text-xs text-ink-2" style={{ opacity: reduced ? 1 : 0 }}>
            {d.finaleMono}
          </p>
        </div>

        {/* phase rail — dock is off for now, so it sits at a natural height.
            On phones the four labels wrap into two tidy lines instead of
            spilling out of a pill that was never meant to hold them */}
        <div ref={phaseRef} className="absolute inset-x-0 bottom-10 z-10 flex justify-center px-4">
          <div className="glass flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-[28px] px-5 py-3 md:gap-x-5 md:rounded-full md:px-6">
            {d.phases.map((p, i) => (
              <span key={p} className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-300",
                    phase === i || (reduced && i === 3) ? "bg-marker" : "bg-ink/20"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300",
                    phase === i || (reduced && i === 3) ? "text-ink" : "text-ink-2/70"
                  )}
                >
                  {p}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* everything past the showpiece runs on the clean white page */}
      <div className="relative bg-paper">
        <MiniDemo />
      </div>
    </section>
  );
}

/* ————————————————— mini demo (paid) ————————————————— */
type MiniState = "idle" | "paywall" | "processing" | "working" | "flying" | "done";

/** The little AI core the query flies into. */
function AiCore({ mode, reduced }: { mode: MiniState; reduced: boolean }) {
  const live = mode === "working" || mode === "flying";
  const hot = mode === "flying";
  return (
    <div className="relative flex size-14 items-center justify-center" aria-hidden="true">
      {/* orbiting satellites */}
      <motion.div
        className="absolute inset-0"
        animate={reduced || !live ? undefined : { rotate: 360 }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-cobalt" />
        <span className="absolute bottom-0 left-[22%] size-1.5 -translate-x-1/2 rounded-full bg-marker" />
        <span className="absolute bottom-0 right-[22%] size-1.5 translate-x-1/2 rounded-full bg-glow-pink" />
      </motion.div>
      {/* the core itself — a solid cobalt bead so it always reads */}
      <div
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full transition-all duration-700",
          hot
            ? "scale-110 bg-gradient-to-br from-cobalt to-cobalt-deep shadow-cobalt"
            : live
              ? "bg-gradient-to-br from-cobalt/90 to-cobalt-deep shadow-cobalt/60"
              : "bg-gradient-to-br from-ink/25 to-ink/40"
        )}
      >
        <Sparkles
          className={cn(
            "size-4.5 transition-all duration-700",
            hot || live ? "scale-110 text-white" : "text-white/70"
          )}
        />
        {/* thin glass rim */}
        <span
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-full border transition-colors duration-700",
            hot || live ? "border-cobalt/40" : "border-ink/10"
          )}
          aria-hidden="true"
        />
      </div>
      {/* soft halo — always readable against the light pad */}
      <motion.span
        className={cn(
          "absolute inset-[-14px] rounded-full blur-md transition-colors duration-700",
          hot ? "bg-cobalt/40" : live ? "bg-cobalt/25" : "bg-cobalt/10"
        )}
        animate={reduced ? undefined : hot ? { opacity: [0.55, 1, 0.55] } : { opacity: 1 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** A deck card that spirals in from far away — one by one, circling. */
function SpiralCard({
  i,
  img,
  tag,
  title,
  reduced,
}: {
  i: number;
  img: string;
  tag: string;
  title: string;
  reduced: boolean;
}) {
  // each card departs from its own point on a far circle and sweeps
  // along the arc before settling — a spiral, not a straight line
  const angle = -150 + i * 58;
  const R = 720 + (i % 3) * 110;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const x0 = Math.cos(rad(angle)) * R;
  const y0 = Math.sin(rad(angle)) * R * 0.55;
  const x1 = Math.cos(rad(angle + 84)) * R * 0.52;
  const y1 = Math.sin(rad(angle + 84)) * R * 0.52 * 0.55;
  const x2 = Math.cos(rad(angle + 156)) * R * 0.17;
  const y2 = Math.sin(rad(angle + 156)) * R * 0.17 * 0.55;
  const trailColor = i % 2 === 0 ? "#FF5C8A" : "#2F5BFF";

  return (
    <motion.div
      initial={
        reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.25,
              rotate: angle * 0.55,
              x: x0,
              y: y0,
              filter: "blur(7px)",
            }
      }
      animate={
        reduced
          ? { opacity: 1 }
          : {
              opacity: 1,
              scale: 1,
              rotate: 0,
              x: [x0, x1, x2, 0],
              y: [y0, y1, y2, 0],
              filter: ["blur(7px)", "blur(3px)", "blur(0px)", "blur(0px)"],
            }
      }
      exit={{ opacity: 0, scale: 0.7, y: 46, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
      transition={
        reduced
          ? { duration: 0.35, delay: 0.06 * i }
          : {
              duration: 1.45,
              delay: 0.16 + i * 0.16,
              times: [0, 0.42, 0.78, 1],
              ease: [0.3, 0.72, 0.22, 1],
            }
      }
      className="group"
    >
      <div className="glass-liquid relative rounded-2xl p-2 shadow-glass transition-transform duration-500 group-hover:-translate-y-1.5">
        <BorderTrail size={64} color={trailColor} duration={5.4 + i * 0.45} className="opacity-80" />
        <div className="overflow-hidden rounded-xl border border-ink/[0.06]">
          <img
            src={`/images/slides/${img}.webp?v=3`}
            alt={`${tag}: ${title}`}
            className="w-full select-none"
            loading="lazy"
            decoding="async"
            width={dim(img)[0]}
            height={dim(img)[1]}
            draggable={false}
          />
        </div>
        <div className="flex items-start justify-between gap-2 px-2 pb-1 pt-2">
          <p className="line-clamp-2 min-w-0 font-heading text-[12px] font-bold leading-tight text-ink md:text-[13px]">{title}</p>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2/70">{tag} · 16:9</span>
        </div>
      </div>
    </motion.div>
  );
}

function MiniDemo() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const [value, setValue] = useState("");
  const [state, setState] = useState<MiniState>("idle");
  const [paid, setPaid] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);
  const queryRef = useRef<HTMLParagraphElement>(null);
  const timers = useRef<Array<number>>([]);

  const d = t.transform.miniDemo;
  const pw = t.transform.paywall;
  const slides = t.transform.slides;
  const target = value.trim() || d.defaultQuery;

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const resetQuery = () => {
    if (queryRef.current) gsap.killTweensOf(queryRef.current);
    if (queryRef.current) gsap.set(queryRef.current, { clearProps: "all" });
  };

  const startTyping = () => {
    setState("working");
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target.length,
      duration: 1.15,
      ease: "power1.inOut",
      onUpdate: () => {
        if (typedRef.current) typedRef.current.textContent = target.slice(0, Math.round(obj.n));
      },
      onComplete: () => {
        // small beat, then the finished query flies up into the AI core
        timers.current.push(window.setTimeout(() => flyToAI(), 420));
      },
    });
  };

  /** swap deck → workpad first, let it mount, then start typing */
  const queueTyping = (delay = 420) => {
    setState("working");
    timers.current.push(window.setTimeout(() => startTyping(), delay));
  };

  const flyToAI = () => {
    setState("flying");
    if (!reduced && queryRef.current) {
      gsap.to(queryRef.current, {
        y: -92,
        scale: 0.18,
        opacity: 0,
        filter: "blur(5px)",
        duration: 0.9,
        ease: "power2.inOut",
      });
    }
    // the core "thinks", then the deck blooms in — card after card
    timers.current.push(
      window.setTimeout(() => {
        setState("done");
        playSfx("success");
      }, reduced ? 500 : 1750)
    );
  };

  const run = () => {
    if (state === "working" || state === "processing" || state === "flying") return;
    playSfx("click");
    if (!paid) {
      setState("paywall");
      return;
    }
    resetQuery();
    queueTyping();
  };

  const buy = () => {
    if (state === "processing") return;
    playSfx("click");
    setState("processing");
    timers.current.push(
      window.setTimeout(() => {
        setPaid(true);
        playSfx("success");
        resetQuery();
        queueTyping();
      }, 1900)
    );
  };

  const again = () => {
    playSfx("click");
    resetQuery();
    setState("idle");
  };

  return (
    <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32">
      <div className="text-center">
        <p className="mono-label">{d.label}</p>
        <p className="mt-2 font-mono text-xs text-ink-2/70">{d.note}</p>
      </div>

      <div className="glass-liquid relative mt-10 rounded-[28px] p-5 shadow-glass md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (state === "done") resetQuery();
                if (state !== "idle") setState("idle");
              }}
              placeholder={d.placeholder}
              aria-label={d.label}
              className="w-full rounded-full border border-ink/10 bg-white/70 px-5 py-3.5 font-mono text-sm text-ink outline-none transition-shadow placeholder:text-ink-2/60 focus:border-cobalt/50 focus:shadow-cobalt/20 focus-visible:outline-2 focus-visible:outline-cobalt"
            />
            <span
              className={cn(
                "absolute -top-2.5 right-4 flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em]",
                paid ? "bg-marker text-ink" : "bg-ink text-white"
              )}
            >
              {paid ? <Check className="size-2.5" aria-hidden="true" /> : <Lock className="size-2.5" aria-hidden="true" />}
              {paid ? d.activeChip : d.lockChip}
            </span>
          </div>
          <button
            type="button"
            onClick={run}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-heading text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-cobalt hover:shadow-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"
          >
            {state === "working" || state === "processing" || state === "flying" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {state === "working" ? d.working : state === "flying" ? d.flying : pw.processing}
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-marker" aria-hidden="true" />
                {d.button}
                <CornerDownLeft className="size-3.5 opacity-60" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {d.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setValue(preset);
                resetQuery();
                setState("idle");
              }}
              className="rounded-full border border-ink/10 bg-white/60 px-3.5 py-1.5 font-mono text-[11px] text-ink-2 transition-all duration-300 hover:border-cobalt/40 hover:text-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="relative mt-7 min-h-[320px] md:min-h-[300px]">
          <AnimatePresence mode="wait">
            {state !== "done" ? (
              <motion.div
                key="workpad"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                transition={{ duration: 0.45 }}
                className={cn(
                  "relative flex min-h-[320px] flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-ink/15 bg-mist/60 p-6 md:min-h-[300px]",
                  state === "working" && "border-cobalt/40"
                )}
                aria-live="polite"
              >
                {/* the AI core the query flies into */}
                <div className="absolute top-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
                  <AiCore mode={state} reduced={reduced} />
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-2/60">
                    {state === "flying" ? d.flying : "deck-7"}
                  </p>
                </div>

                <p
                  ref={queryRef}
                  className="w-full max-w-lg pt-10 text-center font-mono text-sm leading-loose text-ink-2 md:text-base"
                >
                  <span ref={typedRef} className="text-ink" />
                  {(state === "working" || state === "flying") && (
                    <span
                      className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-cobalt animate-blink"
                      aria-hidden="true"
                    />
                  )}
                </p>

                {state === "idle" && (
                  <p className="font-mono text-[11px] text-ink-2/50">{d.placeholder}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="deck"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
                aria-live="polite"
              >
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {slides.map((s, i) => (
                    <SpiralCard key={s.img} i={i} img={s.img} tag={s.tag} title={s.title} reduced={reduced} />
                  ))}
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <p className="text-center font-mono text-xs text-ink-2">{d.done}</p>
                  <button
                    type="button"
                    onClick={again}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 font-heading text-xs font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    {d.again}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ——— paywall: generation requires a subscription — a proper
              viewport-level dialog: centered, above the header, and safely
              scrollable on short screens so nothing is ever cut off ——— */}
          <AnimatePresence>
            {state === "paywall" || state === "processing" ? (
              <motion.div
                key="paywall"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="scroll-thin fixed inset-0 z-[70] overflow-y-auto bg-mist/75 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                aria-label={pw.title}
              >
                <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ y: 30, scale: 0.94 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-liquid relative my-auto w-[min(100%,420px)] rounded-[24px] p-6 shadow-lift md:p-7"
                >
                  <BorderTrail size={110} color="#FF5C8A" duration={5.2} />

                  <div className="flex items-center justify-between">
                    <span className="marker-hl font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{pw.badge}</span>
                    <button
                      type="button"
                      onClick={() => setState("idle")}
                      aria-label={pw.later}
                      className="flex size-8 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-cobalt"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <h3 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-ink">{pw.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{pw.sub}</p>

                  <div className="mt-5 flex items-baseline gap-2 rounded-2xl border border-ink/[0.07] bg-white/60 px-4 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{pw.plan}</span>
                    <span className="font-display text-2xl font-bold tracking-tight text-ink">{pw.price}</span>
                    <span className="font-mono text-xs text-ink-2">/ {pw.period}</span>
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {pw.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2">
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-cobalt/10 text-cobalt" aria-hidden="true">
                          <Check className="size-2.5" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={buy}
                    disabled={state === "processing"}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-heading text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-cobalt hover:shadow-cobalt focus-visible:outline-2 focus-visible:outline-cobalt disabled:cursor-wait disabled:opacity-70"
                  >
                    {state === "processing" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {pw.processing}
                      </>
                    ) : (
                      <>
                        <Lock className="size-4 text-marker" aria-hidden="true" />
                        {pw.buy}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-2 w-full rounded-full px-6 py-2 font-heading text-sm font-semibold text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-cobalt"
                  >
                    {pw.later}
                  </button>
                  <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2/60">{pw.note}</p>
                </motion.div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
