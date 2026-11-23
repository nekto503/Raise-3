"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { Lock } from "lucide-react";
import { SectionHead } from "@/components/bits/SectionHead";
import { useT } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * One computer screen, rotating on a turntable through four full turns.
 * The five moods swap while the display is edge-on (mid-back), so the viewer
 * never sees a flip — the machine simply comes back around wearing the next
 * style. Scroll windows (deg): 0-90 mood 0 | 270-450 mood 1 | 630-810 mood 2
 * | 990-1170 mood 3 | 1350-1440 mood 4 — ends face-on.
 */
const SWAPS = [180, 540, 900, 1260];

export function StylesSection() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const screenRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const proxy = useRef({ rot: 0 });

  useEffect(() => {
    if (reduced || !screenRef.current || !stageRef.current) return;

    const layout = (rot: number) => {
      if (stageRef.current) stageRef.current.style.transform = `rotateY(${rot}deg)`;
      let idx = 0;
      if (rot >= SWAPS[3]) idx = 4;
      else if (rot >= SWAPS[2]) idx = 3;
      else if (rot >= SWAPS[1]) idx = 2;
      else if (rot >= SWAPS[0]) idx = 1;
      setActive((prev) => (prev === idx ? prev : idx));
    };

    layout(0);

    const tween = gsap.to(proxy.current, {
      rot: 1440,
      ease: "none",
      duration: 1,
      onUpdate: () => layout(proxy.current.rot),
      scrollTrigger: {
        trigger: screenRef.current,
        start: "top top",
        end: "+=2600",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  const d = t.styles;
  const activeStyle = d.list[active];

  const holdProps = {
    onPointerDown: () => setHeld(true),
    onPointerUp: () => setHeld(false),
    onPointerLeave: () => setHeld(false),
    onPointerCancel: () => setHeld(false),
    onClick: () => setHeld((h) => !h), // keyboard/tap fallback
  };

  return (
    <section id="styles" className="relative bg-paper">
      <div
        ref={screenRef}
        className={cn(
          "relative flex h-screen flex-col overflow-hidden",
          reduced && "h-auto min-h-screen"
        )}
      >
        {/* head — in the flow at the top, clear of the stage below */}
        <div className="w-full shrink-0 px-6 pt-[84px] md:px-10 md:pt-[92px]">
          <SectionHead
            align="center"
            label={d.label}
            title={d.title}
            sub={d.sub}
            className="max-w-xl"
            titleClassName="text-2xl md:text-3xl"
          />
        </div>

        {/* the rotating computer — the camera parks a touch lower on the
            machine, so it rides a little higher in the frame and the compare
            button underneath is always fully clear of the base. On short
            viewports .machine-zoom proportionally shrinks the whole thing
            (layout included), so the pinned column always fits */}
        <div className="relative flex flex-1 items-center justify-center pb-[2.5vh]">
          <div
            className="machine-zoom relative flex h-[288px] items-center justify-center md:h-[380px]"
            style={{ perspective: "1600px" }}
            aria-label={d.title}
          >
            <div
              ref={stageRef}
              className="relative h-[252px] w-[344px] [transform-style:preserve-3d] md:h-[336px] md:w-[472px]"
            >
              {/* FRONT — the computer (browser window on a laptop base) */}
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <ComputerShell index={active} held={held} beforeText={t.transform.prompt} />
              </div>
              {/* BACK — the monitor's back panel, visible mid-turn */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <MonitorBack />
              </div>
            </div>
          </div>
        </div>

        {/* active style caption — anchored at the bottom, always in view */}
        <div className="w-full shrink-0 px-6 pb-6 md:pb-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-start text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStyle.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-full"
            >
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-center font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{activeStyle.name}</h3>
              </div>
              <p className="mt-2 text-lg text-ink-2">{activeStyle.desc}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {activeStyle.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-2">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* hold to compare */}
          <button
            type="button"
            {...holdProps}
            aria-pressed={held}
            aria-label={t.a11y.holdCompare}
            className={cn(
              "mt-2 inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border px-6 py-3 text-center font-heading text-sm font-bold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-cobalt",
              held ? "border-cobalt/60 bg-cobalt text-white shadow-cobalt" : "border-ink/10 bg-white/70 text-ink hover:border-cobalt/40"
            )}
          >
            <span className={cn("size-2 rounded-full transition-colors", held ? "bg-marker" : "bg-ink/20")} aria-hidden="true" />
            {d.hold}
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {held ? `← ${d.before}` : `${d.after} →`}
            </span>
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————— device mockups ————— */

/** The Raise 3 logo mark (three ascending bars), sized for device screens. */
function LogoMark({ size = 22, dark = false }: { size?: number; dark?: boolean }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect x="6" y="36" width="13" height="22" rx="4.5" fill={dark ? "#ffffff" : "#0A0A0A"} />
      <rect x="25.5" y="24" width="13" height="34" rx="4.5" fill={dark ? "#ffffff" : "#0A0A0A"} />
      <rect x="45" y="6" width="13" height="52" rx="4.5" fill="#FF5C8A" />
    </svg>
  );
}

/** One mood treatment of the same content: logo + neural-network name. */
function MoodScreen({ index }: { index: number }) {
  const name = (extra: string) => (
    <span className={cn("font-display font-bold leading-none tracking-tight", extra)}>Raise&nbsp;<span className="text-marker">3</span></span>
  );

  if (index === 1) {
    // neon — dark stage glow
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-ink">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, #2F5BFF 0%, transparent 50%), radial-gradient(circle at 75% 80%, #FF5C8A 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />
        <div style={{ filter: "drop-shadow(0 0 12px #2F5BFF)" }}>
          <LogoMark size={30} dark />
        </div>
        <span className="font-display text-2xl font-bold tracking-tight text-white" style={{ textShadow: "0 0 14px rgba(126,200,242,0.8)" }}>
          Raise <span className="text-marker">3</span>
        </span>
        <span className="absolute bottom-3 font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">stage mode</span>
      </div>
    );
  }
  if (index === 2) {
    // editorial — cream paper, serif
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-[#FBF6ED]">
        <LogoMark size={24} />
        <span className="font-serif text-2xl font-bold italic tracking-tight text-ink">Raise&nbsp;3</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-ink-2">issue №4</span>
      </div>
    );
  }
  if (index === 3) {
    // corporate — cobalt header band
    return (
      <div className="relative flex h-full w-full flex-col bg-white">
        <div className="flex items-center justify-between bg-cobalt px-4 py-2.5">
          <span className="font-heading text-[10px] font-bold tracking-wide text-white">RAISE 3</span>
          <span className="font-mono text-[8px] text-white/70">deck engine</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
          <LogoMark size={26} />
          {name("text-xl text-ink")}
        </div>
      </div>
    );
  }
  if (index === 4) {
    // craft — warm paper, tape strips
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-2.5 overflow-hidden bg-[#FFF4DC]">
        <span className="absolute left-3 top-4 h-4 w-16 -rotate-6 rounded-sm bg-white/70 shadow-soft" aria-hidden="true" />
        <span className="absolute bottom-5 right-3 h-4 w-12 rotate-3 rounded-sm bg-glow-pink/60 shadow-soft" aria-hidden="true" />
        <LogoMark size={24} />
        <span className="px-5 font-heading text-xl font-medium tracking-tight text-ink">
          Raise&nbsp;<span className="marker-hl text-base">3</span>
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink-2">warm & craft</span>
      </div>
    );
  }
  // 0 — minimal: white, air, lines
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white">
      <LogoMark size={28} />
      {name("text-2xl text-ink")}
      <div className="mt-1 space-y-1.5" aria-hidden="true">
        <span className="block h-px w-16 bg-ink/25" />
        <span className="block h-px w-10 bg-ink/15" />
      </div>
    </div>
  );
}

/** BEFORE state: the plain draft text on the device screen. */
function DraftScreen({ beforeText }: { beforeText: string }) {
  return (
    <div className="flex h-full w-full flex-col bg-white p-4 md:p-6">
      <span className="font-mono text-[8px] tracking-[0.2em] text-ink-2/60">draft.txt</span>
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-2 md:text-[11px]">
        {beforeText.slice(0, 120)}
        <span className="ml-0.5 inline-block h-[1em] w-[2px] bg-ink/40 animate-blink" aria-hidden="true" />
      </p>
      <div className="mt-auto flex items-center gap-2">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[7px] text-ink-2/50">plain text</span>
      </div>
    </div>
  );
}

/** A computer screen: browser chrome with traffic lights + url pill, on a base. */
function ComputerShell({ index, held, beforeText }: { index: number; held: boolean; beforeText: string }) {
  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden rounded-[16px] border border-ink/10 bg-white shadow-lift">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-ink/[0.07] bg-mist/90 px-3 py-2.5 md:px-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-marker" />
            <span className="size-3 rounded-full bg-glow-pink" />
            <span className="size-3 rounded-full bg-glow-sky" />
          </div>
          <div className="mx-auto flex min-w-[130px] items-center justify-center gap-1.5 rounded-full border border-ink/[0.06] bg-white px-4 py-1 md:min-w-[170px]">
            <Lock className="size-3 text-ink-2/70" aria-hidden="true" />
            <span className="font-mono text-[10px] font-medium text-ink-2 md:text-xs">raise3.app</span>
          </div>
          <div className="w-[26px]" aria-hidden="true" />
        </div>
        {/* the screen — the current mood (or the draft when held) */}
        <div className="relative h-[194px] md:h-[268px]">
          <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: held ? 0 : 1 }} aria-hidden={held}>
            <MoodScreen index={index} />
          </div>
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: held ? 1 : 0, pointerEvents: "none" }}
            aria-hidden={!held}
          >
            <DraftScreen beforeText={beforeText} />
          </div>
        </div>
      </div>
      {/* laptop hinge + base — reads unmistakably as a computer */}
      <div className="mx-auto h-[8px] w-[62%] rounded-b-[12px] rounded-t-[4px] bg-ink/85" aria-hidden="true" />
      <div className="mx-auto h-[11px] w-[92%] rounded-b-[14px] bg-ink/90" aria-hidden="true" />
    </div>
  );
}

/** The back of the monitor: dark panel with the mark — seen mid-turn. */
function MonitorBack() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[16px] border border-ink/10 bg-ink shadow-lift">
      {/* vent slots */}
      <div className="absolute inset-x-10 top-6 flex justify-between" aria-hidden="true">
        <span className="h-[3px] w-14 rounded-full bg-white/10" />
        <span className="h-[3px] w-14 rounded-full bg-white/10" />
      </div>
      <div className="absolute inset-x-10 top-10 flex justify-between" aria-hidden="true">
        <span className="h-[3px] w-14 rounded-full bg-white/10" />
        <span className="h-[3px] w-14 rounded-full bg-white/10" />
      </div>
      <LogoMark size={44} dark />
      <span className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/40">raise 3</span>
      {/* spec sticker */}
      <span className="absolute bottom-7 right-8 rounded-md border border-white/10 px-2.5 py-1 font-mono text-[8px] text-white/30">
        MN-03 · 16:9
      </span>
      <span className="absolute bottom-7 left-8 font-mono text-[8px] text-white/25">designed by the network</span>
    </div>
  );
}
