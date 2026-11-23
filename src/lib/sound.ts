"use client";

import { useUI } from "@/lib/store";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, to: number, dur: number, gain: number, type: OscillatorType) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export type Sfx = "click" | "hover" | "toggle" | "success" | "send";

export function playSfx(kind: Sfx) {
  if (typeof window === "undefined") return;
  if (!useUI.getState().sound) return;
  switch (kind) {
    case "click":
      blip(660, 240, 0.09, 0.05, "square");
      break;
    case "hover":
      blip(880, 700, 0.04, 0.02, "sine");
      break;
    case "toggle":
      blip(440, 440, 0.06, 0.04, "triangle");
      break;
    case "send":
      blip(520, 880, 0.16, 0.05, "sine");
      break;
    case "success":
      blip(523.25, 523.25, 0.14, 0.05, "sine");
      setTimeout(() => blip(783.99, 783.99, 0.22, 0.05, "sine"), 90);
      setTimeout(() => blip(1046.5, 1046.5, 0.3, 0.04, "sine"), 190);
      break;
  }
}
