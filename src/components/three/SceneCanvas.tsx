"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { sp, useUI } from "@/lib/store";
import { buildSlideTextures, type SlideTexture } from "@/lib/slideTexture";
import { Scene } from "./Scene";

/**
 * The one persistent 3D canvas living behind the page content.
 * Renders only while a transparent section is on screen (frameloop "never"
 * otherwise) to keep the rest of the scroll at 60fps.
 */
export default function SceneCanvas() {
  const webgl = useUI((s) => s.webgl);
  const visible = useUI((s) => s.canvasVisible);
  const quality = useUI((s) => s.quality);
  const ready = useUI((s) => s.ready);
  const [slides, setSlides] = useState<SlideTexture[] | null>(null);

  // cursor tracking for parallax / magnetism
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sp.mx = (e.clientX / window.innerWidth) * 2 - 1;
      sp.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    let live = true;
    buildSlideTextures()
      .then((s) => {
        if (live) setSlides(s);
      })
      .catch(() => {
        /* slides are decorative — page works without the canvas */
      });
    return () => {
      live = false;
    };
  }, []);

  if (!webgl) {
    // graceful fallback: static CSS studio blobs
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="blob animate-float-slow -top-32 -left-40 w-[46rem] h-[46rem] bg-glow-sky/50" />
        <div className="blob animate-float-slow top-1/3 -right-52 w-[42rem] h-[42rem] bg-glow-pink/45" style={{ animationDelay: "-2.4s" }} />
        <div className="blob animate-float-slow -bottom-48 left-1/4 w-[40rem] h-[40rem] bg-glow-violet/40" style={{ animationDelay: "-4.8s" }} />
      </div>
    );
  }

  if (!slides) return null;

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <Canvas
        dpr={quality === "high" ? [1, 2] : [1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10], fov: 42, near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <Scene slides={slides} />
        </Suspense>
      </Canvas>
    </div>
  );
}
