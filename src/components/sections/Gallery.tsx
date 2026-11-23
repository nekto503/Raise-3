"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { SplitTitle } from "@/components/bits/SplitTitle";
import { useT } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

/** true pixel size of each restored long master — lets the browser reserve
 *  the exact aspect box, so nothing shifts or crops when the art lands */
const SLIDE_DIMS: Record<string, [number, number]> = {
  s1: [1600, 601],
  s2: [1600, 604],
  s3: [1600, 579],
  s4: [1600, 582],
  s5: [1600, 645],
  s6: [1600, 482],
};
const dim = (img: string): [number, number] => SLIDE_DIMS[img] ?? [1600, 600];

export function Gallery() {
  const t = useT();
  const reduced = useUI((s) => s.reduced);
  const screenRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    if (reduced || !screenRef.current || !trackRef.current) return;
    const track = trackRef.current;
    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: screenRef.current,
        start: "top top",
        end: "+=2600",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // inner image parallax against the track motion
          imgRefs.current.forEach((img) => {
            if (!img) return;
            img.style.transform = `translateX(${(0.5 - self.progress) * 9}%) scale(1.12)`;
          });
        },
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <section id="cases" className="relative bg-paper">
      <div
        ref={screenRef}
        className={cn(
          "relative flex h-screen flex-col overflow-hidden",
          reduced && "h-auto min-h-screen"
        )}
      >
        {/* head — in the flow at the top so it can never overlap the cards below */}
        <div className="w-full shrink-0 px-6 pt-[84px] md:px-10 md:pt-[92px]">
          <div className="glass-liquid max-w-md rounded-[20px] px-5 py-4 shadow-glass md:px-6">
            <p className="mono-label">{t.gallery.label}</p>
            <SplitTitle
              as="h2"
              words={[{ text: t.gallery.title }]}
              className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-ink md:text-3xl"
            />
            <p className="mt-2 font-mono text-xs leading-relaxed text-ink-2">{t.gallery.sub}</p>
          </div>
        </div>

        {/* the horizontal deck, centered in whatever space is left */}
        <div className="relative flex flex-1 items-center overflow-visible">
          <div
            ref={trackRef}
            className={cn(
              "flex w-max items-stretch gap-6 px-[7vw] md:gap-10",
              reduced &&
                "w-auto overflow-x-auto px-0 py-10 [scroll-snap-type:x_mandatory] scroll-thin md:overflow-x-auto"
            )}
          >
          {t.gallery.cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)", y: 30 }}
              whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.05, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group w-[78vw] shrink-0 md:w-[26rem]",
                reduced && "snap-center first:pl-6"
              )}
            >
              <div className="relative overflow-hidden rounded-[28px] border border-ink/[0.06] bg-white shadow-glass transition-shadow duration-500 group-hover:shadow-lift">
                <div className="relative overflow-hidden">
                  <img
                    ref={(el) => {
                      imgRefs.current[i] = el;
                    }}
                    src={`/images/slides/${c.img}.webp?v=3`}
                    alt={`${c.tag}: ${c.title}`}
                    loading="lazy"
                    decoding="async"
                    width={dim(c.img)[0]}
                    height={dim(c.img)[1]}
                    className={cn(
                      "w-full select-none",
                      reduced ? "" : "scale-[1.12] will-change-transform",
                      "transition-[transform,filter] duration-700 group-hover:scale-[1.16] group-hover:brightness-105"
                    )}
                    style={reduced ? undefined : { transform: "translateX(0%) scale(1.12)" }}
                    draggable={false}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink backdrop-blur">
                    {c.tag} · 16:9
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 p-6">
                  <div>
                    <h3 className="font-heading text-2xl font-extrabold tracking-tight text-ink">{c.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{c.desc}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
