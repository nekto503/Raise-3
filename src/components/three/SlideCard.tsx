"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { sp } from "@/lib/store";
import { clamp01, easeInOut, lerp, seg } from "@/lib/anim";
import type { SlideTexture } from "@/lib/slideTexture";

/** spawn ring: far off-screen points the generated deck sweeps in from —
 *  nothing floats on first entry, the cards only exist after the prompt */
const HERO: Array<{ p: [number, number, number]; s: number }> = [
  { p: [-5.4, 3.3, -3.2], s: 1.5 },
  { p: [5.9, 3.8, -4.2], s: 1.22 },
  { p: [-5.6, -2.9, -2.0], s: 1.38 },
  { p: [5.1, -2.7, -2.6], s: 1.42 },
  { p: [-1.2, 3.5, -4.8], s: 1.26 },
  { p: [4.8, -3.6, -5.4], s: 1.18 },
  { p: [-4.8, -3.7, -6.0], s: 1.12 },
];

/** the neural-network core the query flies into (rig-local space) */
const SPHERE_P = new THREE.Vector3(0, 0.35, -2.2);
/** where the core drifts once the demo is over (its closing perch) */
const PERCH_P = new THREE.Vector3(0, 2.1, -4.3);

const W = 2.3;
/** full card width incl. frame — columns are strided wider than this */
const CARD_W = 2.4;
/** tallest card incl. frame + resting breath — rows are gapped taller */
const CARD_H = 1.18;

/** viewport aspect below which the deck hangs in a compact two-column
 *  spread (portrait phones) instead of the wide three-column one.
 *  Scene.tsx reads the same threshold for its camera-fit math. */
export const COMPACT_ASPECT = 0.8;

/**
 * The show spread. The deck hangs in staggered rows with a column stride
 * wider than a full card and a row gap taller than a full card — so no two
 * cards can ever intersect, the way the old arc's top-middle pair did.
 * Everything sits deep behind the core: no card steps toward the viewer,
 * and the outer seat + card half-width defines what the camera must frame.
 */
function showSeat(i: number, n: number, compact: boolean, out: THREE.Vector3) {
  const cols = compact ? 2 : Math.max(2, Math.ceil(n / 2));
  const rows = Math.ceil(n / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const stride = compact ? CARD_W + 0.6 : CARD_W + 0.5; // 3.0 / 2.9
  // rows hang clear of the core's glass shell (r 0.95 at y 0.35): two-row
  // spreads (any viewport) ring the deck around the ball; the three-row
  // compact lattice encircles it — only inner card edges graze the glass
  const rowGap = rows > 2 ? CARD_H + 0.17 : 2.7;
  const x = (col - (cols - 1) / 2) * stride;
  // rows hang centered a touch above the core's rest line
  const y = 0.35 + ((rows - 1) / 2) * rowGap - row * rowGap;
  // lower rows sink a little deeper, outer cards a hair further back
  const z = -3.05 - row * 0.3 - Math.abs(x) * 0.05;
  out.set(x, y, z);
}

/** the winding return: every card leaves its show seat, joins a tightening
 *  orbit around the core and sweeps into the ball in one continuous motion.
 *  On narrow frames the ring is smaller so the whole fly-away stays inside
 *  the viewport — nothing is ever seen clipped at the edge. */
const RET0 = 0.84;
const RET_STAG = 0.035;
const RET_LEN = 0.13;
const RING_R_WIDE = 3.4;
const RING_R_COMPACT = 1.2;
const SWEEP = 5.0;

export function SlideCard({
  i,
  n,
  slide,
  reduced,
}: {
  i: number;
  n: number;
  slide: SlideTexture;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const boxMat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const faceMat = useRef<THREE.MeshBasicMaterial>(null!);
  const plane = useRef<THREE.Mesh>(null);
  const box = useRef<THREE.Mesh>(null);

  const H = W / slide.aspect;
  const frame = 0.05;

  // reusable vectors — no GC pressure in the frame loop
  const tmp = useRef({
    pos: new THREE.Vector3(),
    fan: new THREE.Vector3(),
    entry: new THREE.Vector3(),
    spiral: new THREE.Vector3(),
    path: new THREE.Vector3(),
    core: new THREE.Vector3(),
    p0: new THREE.Vector3(),
  }).current;

  // staggered windows
  const fan0 = 0.4 + (i / n) * 0.09;
  const fan1 = fan0 + 0.15;
  const ret0 = RET0 + (i / n) * RET_STAG;
  const ret1 = ret0 + RET_LEN;

  useFrame(({ clock, viewport }) => {
    const g = group.current;
    const t = sp.transform;
    const time = clock.elapsedTime;

    // the spread mode mirrors the Scene's camera-fit math: narrow
    // (portrait) viewports hang the deck in a compact two-column lattice
    const compact = viewport.aspect < COMPACT_ASPECT;

    // ————— 1. spawn: before the prompt is typed no deck exists — the cards
    // wait far off-screen, fully hidden (nothing hangs in view on entry) —————
    tmp.pos.set(...HERO[i % HERO.length].p).multiplyScalar(1.55);
    tmp.pos.z = -12;
    let scale = 0.55;
    let opacity = 0;
    let ry = 0.35;
    let rx = 0.2;

    // ————— 2. the show: once the typed prompt has been swallowed by the core,
    // the generated deck sweeps in from afar, blooms into the distant spread
    // and simply lingers on display — nothing ever approaches the viewer —————
    const b = easeInOut(seg(t, fan0, fan1));
    if (b > 0) {
      showSeat(i, n, compact, tmp.fan);
      tmp.pos.lerp(tmp.fan, b);
      scale = lerp(scale, 1.02, b);
      opacity = lerp(opacity, b, b);
      // tilt lerps toward the fixed SEAT tilt (from the final position, never
      // the live one) — a single smooth rotation, so the fly-by never wobbles
      // sideways while the cards sweep past the screen. Narrow frames tilt
      // less: the outer cards' edges swing toward the viewer when turned,
      // and phones have far less side air to spare
      ry = lerp(ry, -tmp.fan.x * (compact ? 0.11 : 0.16), b);
      rx = lerp(rx, -tmp.fan.y * 0.03, b);

      // the resting "breath" fades in only AFTER the card has settled into
      // its seat — zero time-based motion while anything is in flight, so the
      // sweep past the screen is perfectly still
      const br = reduced ? 0 : seg(t, fan1, fan1 + 0.1);
      if (br > 0) {
        tmp.pos.y += Math.sin(time * 0.5 + i * 1.3) * 0.045 * br;
        tmp.pos.x += Math.cos(time * 0.4 + i * 0.9) * 0.03 * br;
        ry += Math.sin(time * 0.3 + i) * 0.02 * br;
      }
    }

    // ————— 3. the return: the whole deck winds around the core and sweeps
    // back into the ball in one continuous dash — shown from afar, gone
    // back into the distance —————
    const v = seg(t, ret0, ret1);
    if (v > 0) {
      const ev = easeInOut(v);
      // the live core — it drifts up to its perch as the last cards merge
      const cd = easeInOut(seg(t, 0.9, 1));
      tmp.core.copy(SPHERE_P).lerp(PERCH_P, cd);

      // the seat this card leaves — live, so the return chains perfectly
      // from wherever the deck currently hangs (even mid-resize)
      showSeat(i, n, compact, tmp.p0);
      const angE = Math.atan2(tmp.p0.y - tmp.core.y, tmp.p0.x - tmp.core.x);

      // phase 1 (0–25%): leave the show seat and join the vortex ring
      const ringR = compact ? RING_R_COMPACT : RING_R_WIDE;
      const e1 = easeInOut(seg(ev, 0, 0.25));
      tmp.entry.set(
        tmp.core.x + Math.cos(angE) * ringR,
        tmp.core.y + Math.sin(angE) * ringR * 0.72,
        -1.4
      );
      // phase 2 (25–100%): the tightening winding sweep into the core
      const e2 = easeInOut(seg(ev, 0.25, 1));
      const ang = angE + SWEEP * e2;
      const r = lerp(ringR, 0.32, e2);
      tmp.spiral.set(
        tmp.core.x + Math.cos(ang) * r,
        tmp.core.y + Math.sin(ang) * r * 0.72,
        lerp(-1.4, tmp.core.z, e2)
      );
      // the chained path — both seams are exact, so nothing pops
      tmp.path.copy(tmp.p0).lerp(tmp.entry, e1);
      tmp.path.lerp(tmp.spiral, e2);

      // blend out of the live show position — continuous by construction
      tmp.pos.lerp(tmp.path, ev);
      scale = lerp(scale, lerp(1, 0.14, seg(ev, 0.55, 1)), ev);
      opacity = lerp(opacity, 1 - clamp01((v - 0.86) / 0.14), ev);
      ry = lerp(ry, -tmp.pos.x * 0.1 + e2 * 1.9, ev);
      rx = lerp(rx, -tmp.pos.y * 0.04 * (1 - e2), ev);
    }

    // ————— after the demo: the deck lives inside the circle —————

    g.position.copy(tmp.pos);
    g.scale.setScalar(Math.max(scale, 0.001));
    g.visible = opacity > 0.015;
    // the roll wobble too only lives once the deck is settled on display —
    // never mid-flight
    const rollWob = reduced ? 0 : seg(t, fan1, fan1 + 0.1);
    g.rotation.set(rx, ry, reduced ? 0 : Math.sin(time * 0.25 + i) * 0.02 * rollWob * opacity);

    if (boxMat.current) boxMat.current.opacity = opacity;
    if (faceMat.current) faceMat.current.opacity = clamp01(opacity * 1.05);
  });

  return (
    <group ref={group}>
      <RoundedBox
        ref={box}
        args={[W + frame * 2, H + frame * 2, 0.055]}
        radius={0.03}
        smoothness={3}
      >
        <meshPhysicalMaterial
          ref={boxMat}
          color="#ffffff"
          roughness={0.26}
          metalness={0.06}
          clearcoat={0.8}
          clearcoatRoughness={0.22}
          transparent
          opacity={1}
        />
      </RoundedBox>
      <mesh ref={plane} position={[0, 0, 0.029]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial ref={faceMat} map={slide.texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
