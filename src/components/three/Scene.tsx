"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import { sp, useUI } from "@/lib/store";
import { seg } from "@/lib/anim";
import { SlideCard, COMPACT_ASPECT } from "./SlideCard";
import { GlowSphere } from "./GlowSphere";
import { Particles } from "./Particles";
import { makeDotTexture, makeGlowTexture, type SlideTexture } from "@/lib/slideTexture";

/**
 * Studio lighting built purely from Lightformers — no external HDRI needed,
 * gives the krea-style gradient reflections (sky -> pink -> violet).
 */
function StudioEnv({ high }: { high: boolean }) {
  return (
    <Environment resolution={high ? 256 : 128} frames={1} background={false}>
      {/* white key light from above */}
      <Lightformer intensity={2.6} rotation-x={Math.PI / 2} position={[0, 5, -6]} scale={[12, 6, 1]} />
      {/* soft bottom fill */}
      <Lightformer intensity={1.1} rotation-x={-Math.PI / 2} position={[0, -4, -6]} scale={[12, 6, 1]} color="#eef2ff" />
      {/* sky panel left */}
      <Lightformer intensity={4} color="#7EC8F2" position={[7, 1, 1]} scale={[3, 7, 1]} rotation-y={-Math.PI / 2.6} />
      {/* pink panel right */}
      <Lightformer intensity={4} color="#FFB3D9" position={[-7, -1, 1]} scale={[3, 7, 1]} rotation-y={Math.PI / 2.6} />
      {/* violet wash behind */}
      <Lightformer intensity={2.6} color="#B9A3E8" position={[0, 1, -7]} scale={[10, 5, 1]} />
      {/* rose kicker */}
      <Lightformer intensity={1.6} color="#FF7FA8" form="circle" position={[2.5, -2.5, 3]} scale={[2, 2, 1]} />
      {/* crisp white front strip for chrome streaks */}
      <Lightformer intensity={5} position={[0, 2, 6]} scale={[9, 0.7, 1]} rotation-y={Math.PI} />
    </Environment>
  );
}

export function Scene({ slides }: { slides: SlideTexture[] }) {
  const quality = useUI((s) => s.quality);
  const reduced = useUI((s) => s.reduced);
  const high = quality === "high";

  // the full six-slide fan on capable devices, four on low-power ones
  const shown = high ? slides : slides.slice(0, 4);

  const dotTex = useMemo(() => makeDotTexture(), []);
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const rig = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (!rig.current) return;
    // responsive composition scale, solved against the true frustum: the
    // outermost card (outer seat + card half-width 1.25 incl. frame) must
    // stay inside the frame with a 6% side margin at the card depth
    // (camera z 10, seats z −3.05, fov 42°), so no slide is ever clipped at
    // the viewport edge on any device. Narrow portrait viewports hang the
    // deck in a compact two-column spread, which is what the tighter
    // half-span below reflects.
    const a = state.viewport.aspect;
    const compact = a < COMPACT_ASPECT;
    const halfSpan = compact ? 2.75 : 4.15;
    // compact frames get the deeper margin: outer cards tilt toward the
    // viewer, which swings their outer edges a touch wider than the flat
    // math above — the extra air keeps them safely off the screen edge
    const k = (compact ? 0.88 : 0.94) * Math.tan(0.3665); // fov 42° half
    const denom = Math.max(0.6, halfSpan - k * 3.05 * a);
    const fit = Math.min(1, (k * 10 * a) / denom);
    const s = Math.min(1, Math.max(0.3, fit));
    // during the pinned "how" panels the whole rig stays on screen — the
    // neural-network circle IS the background — it just breathes back and
    // sways gently against the horizontal step track
    const howMix = seg(sp.how, 0.02, 0.22) * (1 - seg(sp.how, 0.75, 0.98));
    rig.current.scale.setScalar(s * (1 - 0.14 * howMix));
    // while the pinned demo runs the rig holds dead still — cursor parallax
    // would sway the cards sideways as they sweep past the viewer's face
    const demoLive = sp.transform > 0.02 && sp.transform < 0.98;
    if (!reduced) {
      easing.damp(rig.current.rotation, "x", demoLive ? 0 : sp.my * 0.045, 0.4, delta);
      easing.damp(rig.current.rotation, "y", demoLive ? 0 : sp.mx * 0.085, 0.4, delta);
    }
    easing.damp(rig.current.position, "z", -1.8 * howMix, 0.35, delta);
    easing.damp(rig.current.position, "x", Math.sin(sp.how * Math.PI) * -2.4 * howMix, 0.6, delta);
  });

  return (
    <>
      <StudioEnv high={high} />
      <group ref={rig}>
        {shown.map((slide, i) => (
          <SlideCard key={i} i={i} n={shown.length} slide={slide} reduced={reduced} />
        ))}
        <GlowSphere high={high} glowTex={glowTex} />
        <Particles count={high ? 520 : 240} dotTex={dotTex} />
      </group>
    </>
  );
}
