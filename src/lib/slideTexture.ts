"use client";

import * as THREE from "three";

/** A loaded slide: its GPU texture plus its real aspect ratio. */
export type SlideTexture = { texture: THREE.Texture; aspect: number };

/** the six real slides of the «Креативное мышление» deck (user artwork).
 *  The ?v=3 busts the browser cache — v2 briefly remastered the files to
 *  full-bleed 16:9 (cropping the artwork at the sides); these are back to
 *  the original long masters, edge to edge, nothing cropped. */
export const SLIDE_SRC = [
  "/images/slides/s1.webp?v=3",
  "/images/slides/s2.webp?v=3",
  "/images/slides/s3.webp?v=3",
  "/images/slides/s4.webp?v=3",
  "/images/slides/s5.webp?v=3",
  "/images/slides/s6.webp?v=3",
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

function toTexture(source: HTMLImageElement | HTMLCanvasElement): THREE.Texture {
  const tex = new THREE.Texture(source as TexImageSource);
  tex.colorSpace = THREE.SRGBColorSpace;
  // crisper read at grazing angles on the long master artwork
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** minimal fallback slide (paper card with the deck title) when an image fails */
function fallbackSlide(): { texture: THREE.Texture; aspect: number } {
  const W = 1280;
  const H = 480;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#0A0A0A";
  ctx.font = `800 ${W * 0.06}px 'Arial', sans-serif`;
  ctx.fillText("КРЕАТИВНОЕ", W * 0.07, H * 0.52);
  ctx.fillStyle = "#2F5BFF";
  ctx.fillText("МЫШЛЕНИЕ", W * 0.07, H * 0.72);
  ctx.fillStyle = "#FF5C8A";
  ctx.fillRect(W * 0.07, H * 0.82, W * 0.2, H * 0.03);
  return { texture: toTexture(c), aspect: W / H };
}

/**
 * Loads the six real deck slides as textures. Called once from the 3D canvas.
 */
export async function buildSlideTextures(): Promise<SlideTexture[]> {
  const imgs = await Promise.all(SLIDE_SRC.map((s) => loadImage(s).catch(() => undefined)));
  return imgs.map((img) => {
    if (!img) return fallbackSlide();
    return { texture: toTexture(img), aspect: img.width / img.height };
  });
}

/** soft round dot used by the particle system */
export function makeDotTexture(): THREE.CanvasTexture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** additive glow sprite behind the "thinking" sphere */
export function makeGlowTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(222,236,255,0.85)");
  g.addColorStop(0.25, "rgba(160,200,255,0.35)");
  g.addColorStop(0.55, "rgba(255,190,220,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
