"use client";

import { create } from "zustand";
import type { Lang } from "@/lib/i18n";

interface UIState {
  lang: Lang;
  setLang: (l: Lang) => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  /** preloader finished, hero may enter */
  ready: boolean;
  setReady: (v: boolean) => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;
  /** WebGL available */
  webgl: boolean;
  setWebgl: (v: boolean) => void;
  /** 3D quality tier */
  quality: "high" | "low";
  setQuality: (q: "high" | "low") => void;
  /** is the fixed 3D canvas visible through transparent sections */
  canvasVisible: boolean;
  setCanvasVisible: (v: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  lang: "ru",
  setLang: (lang) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      try {
        localStorage.setItem("raise3.lang", lang);
      } catch {
        /* private mode */
      }
    }
    set({ lang });
  },
  sound: false,
  setSound: (sound) => {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("raise3.sound", sound ? "1" : "0");
      } catch {
        /* noop */
      }
    }
    set({ sound });
  },
  ready: false,
  setReady: (ready) => set({ ready }),
  reduced: false,
  setReduced: (reduced) => set({ reduced }),
  webgl: true,
  setWebgl: (webgl) => set({ webgl }),
  quality: "high",
  setQuality: (quality) => set({ quality }),
  canvasVisible: true,
  setCanvasVisible: (canvasVisible) => set({ canvasVisible }),
}));

/**
 * High-frequency scroll/scene values. Kept OUT of zustand on purpose:
 * mutated by ScrollTrigger callbacks, read inside useFrame without
 * ever triggering React re-renders.
 */
export const sp = {
  /** 0..1 pinned "text -> slide" section progress */
  transform: 0,
  /** 0..1 pinned "how it works" horizontal section progress */
  how: 0,
  /** 0..1 final CTA section progress */
  final: 0,
  /** normalized mouse for parallax / magnetism */
  mx: 0,
  my: 0,
};
