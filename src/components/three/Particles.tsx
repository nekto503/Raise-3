"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { sp } from "@/lib/store";
import { clamp01, easeInOut, lerp, seg } from "@/lib/anim";

const PALETTE: Array<[number, number, number]> = [
  [0.494, 0.784, 0.949], // sky
  [1.0, 0.702, 0.851], // pink
  [1.0, 0.361, 0.541], // rose
  [0.725, 0.639, 0.91], // violet
];

/**
 * Prompt particles: spawn on a disc in front of the camera, spiral into the
 * glass core while the network "thinks" — the query being absorbed.
 * Fully scrub-driven (reversible).
 */
export function Particles({ count, dotTex }: { count: number; dotTex: THREE.Texture }) {
  const points = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.PointsMaterial>(null!);

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 5); // r0, ang0, y0, delay, z0
    for (let i = 0; i < count; i++) {
      const r0 = 2.6 + Math.random() * 2.3;
      const ang0 = Math.random() * Math.PI * 2;
      const y0 = (Math.random() - 0.5) * 3.6;
      const delay = Math.random();
      const z0 = 0.9 + Math.random() * 0.9;
      seeds[i * 5] = r0;
      seeds[i * 5 + 1] = ang0;
      seeds[i * 5 + 2] = y0;
      seeds[i * 5 + 3] = delay;
      seeds[i * 5 + 4] = z0;
      pos[i * 3] = Math.cos(ang0) * r0;
      pos[i * 3 + 1] = y0;
      pos[i * 3 + 2] = z0;
      const c = PALETTE[i % PALETTE.length];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { pos, col, seeds };
  }, [count]);

  useFrame(() => {
    const t = sp.transform;
    const active = t > 0.21 && t < 0.5;
    const p = points.current;
    if (!p) return;
    p.visible = active;
    if (!active) return;

    const phase = seg(t, 0.24, 0.46);
    const arr = p.geometry.attributes.position.array as Float32Array;
    const { seeds } = data;
    for (let i = 0; i < count; i++) {
      const r0 = seeds[i * 5];
      const a0 = seeds[i * 5 + 1];
      const y0 = seeds[i * 5 + 2];
      const delay = seeds[i * 5 + 3];
      const z0 = seeds[i * 5 + 4];
      const e = easeInOut(clamp01((phase - delay * 0.42) / (1 - delay * 0.42)));
      const r = lerp(r0, 0.12, e);
      const ang = a0 + e * 3.6;
      arr[i * 3] = Math.cos(ang) * r;
      arr[i * 3 + 1] = lerp(y0, 0.32, e) + Math.sin(ang * 1.3) * 0.1 * (1 - e);
      arr[i * 3 + 2] = lerp(z0, -1.9, e);
    }
    p.geometry.attributes.position.needsUpdate = true;
    if (mat.current) mat.current.opacity = Math.sin(Math.PI * phase);
  });

  return (
    <points ref={points} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={0.07}
        map={dotTex}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}
