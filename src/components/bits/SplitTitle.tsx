"use client";

import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface TitleWord {
  text: string;
  accent?: "underline" | "marker";
}

/**
 * Splits a heading into animated chars (custom lightweight splitter).
 * Re-splits and replays when the language (i.e. dict reference) changes.
 */
export function SplitTitle({
  words,
  className,
  as: Tag = "h2",
  delay = 0,
  gate = "scroll",
}: {
  words: ReadonlyArray<TitleWord>;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  gate?: "scroll" | "ready";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useUI((s) => s.reduced);
  const ready = useUI((s) => s.ready);

  // hide chars before paint to avoid FOUC
  useLayoutEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll(".split-char");
    gsap.set(chars, { yPercent: 118, opacity: 0, rotateX: -42 });
  }, [reduced, words]);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll(".split-char");

    const tl = gsap.timeline({ paused: true, delay });
    tl.to(chars, {
      yPercent: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.85,
      ease: "power4.out",
      stagger: 0.018,
    });

    if (gate === "ready") {
      if (ready) {
        const id = window.setTimeout(() => tl.play(), 140);
        return () => {
          window.clearTimeout(id);
          tl.kill();
        };
      }
      let played = false;
      const unsub = useUI.subscribe((s) => {
        if (!played && s.ready) {
          played = true;
          tl.play();
        }
      });
      return () => {
        unsub();
        tl.kill();
      };
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => tl.play(),
    });
    return () => {
      st.kill();
      tl.kill();
    };
  }, [reduced, words, ready, gate, delay]);

  const full = words.map((w) => w.text).join(" ");

  // flatten word entries into sub-words so long sentences can wrap
  // between words while individual words never break mid-word
  const pieces: Array<{ text: string; accent?: "underline" | "marker" }> = [];
  words.forEach((w) => {
    w.text
      .split(" ")
      .filter((s) => s.length > 0)
      .forEach((sub) => pieces.push({ text: sub, accent: w.accent }));
  });

  return (
    <div ref={ref} className="[word-spacing:normal]">
      <Tag aria-label={full} className={cn(className)}>
        <span aria-hidden="true">
          {pieces.map((p, pi) => (
            <Fragment key={pi}>
              <span className={cn("split-word", p.accent === "underline" && "word-underline")}>
                {Array.from(p.text).map((ch, ci) => (
                  <span
                    key={ci}
                    className={cn("split-char", p.accent === "marker" && "marker-hl")}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              {pi < pieces.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      </Tag>
    </div>
  );
}
