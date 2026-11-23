"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useUI, sp } from "@/lib/store";
import { initScroll } from "@/lib/scroll";
import { detectLowPower, detectWebGL } from "@/lib/gl";
import { playSfx } from "@/lib/sound";
import { useT } from "@/lib/i18n";

import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SideNav } from "@/components/layout/SideNav";

import { Hero } from "@/components/sections/Hero";
import { TransformSection } from "@/components/sections/TransformSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { StylesSection } from "@/components/sections/Styles";
import { Speed } from "@/components/sections/Speed";
import { Gallery } from "@/components/sections/Gallery";
import { Business } from "@/components/sections/Business";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

export default function Home() {
  const t = useT();

  /* ————— environment detection & smooth scroll ————— */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useUI.getState().setReduced(reduced);
    useUI.getState().setWebgl(detectWebGL());
    useUI.getState().setQuality(detectLowPower() ? "low" : "high");

    try {
      const lang = localStorage.getItem("raise3.lang") ?? localStorage.getItem("slaide.lang");
      if (lang === "en" || lang === "ru") useUI.getState().setLang(lang);
      const sound = localStorage.getItem("raise3.sound") === "1" || localStorage.getItem("slaide.sound") === "1";
      if (sound) useUI.getState().setSound(true);
    } catch {
      /* private mode */
    }

    initScroll(reduced);

    const refresh = () => setTimeout(() => window.dispatchEvent(new Event("scroll")), 60);

    // unlock scrolling once the preloader is gone
    let prevReady = false;
    const unsub = useUI.subscribe((s) => {
      if (s.ready && !prevReady) {
        document.documentElement.classList.remove("overflow-hidden");
        refresh();
      }
      if (!s.ready && !prevReady) {
        document.documentElement.classList.add("overflow-hidden");
      }
      prevReady = s.ready;
    });
    if (useUI.getState().ready) {
      document.documentElement.classList.remove("overflow-hidden");
    } else {
      document.documentElement.classList.add("overflow-hidden");
    }

    // keep the mouse in the shared scene state
    const onMove = (e: PointerEvent) => {
      sp.mx = (e.clientX / window.innerWidth) * 2 - 1;
      sp.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // first successful interaction unlocks the audio context (browser policy)
    const unlock = () => playSfx("hover");
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      unsub();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", unlock);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, []);

  /* ————— 3D canvas visibility: only through transparent sections ————— */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-canvas]"));
    if (els.length === 0) return;
    const active = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting) active.add(id);
          else active.delete(id);
        });
        useUI.getState().setCanvasVisible(active.size > 0);
      },
      { threshold: 0.01 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-ink px-6 py-3 font-heading text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.a11y.skip}
      </a>

      <Preloader />
      {/* Custom cursor disabled for now — native cursor. <Cursor /> */}
      <Header />
      <SideNav />
      {/* Bottom dock temporarily disabled. <DockBar /> */}

      <SceneCanvas />

      <div id="main" className="relative z-10 flex min-h-screen flex-col">
        <Hero />
        <TransformSection />
        <HowItWorks />
        <Features />
        <StylesSection />
        <Speed />
        <Gallery />
        <Business />
        <Pricing />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </>
  );
}
