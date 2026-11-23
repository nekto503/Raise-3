"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { sp } from "@/lib/store";
import { easeInOut, seg } from "@/lib/anim";

/**
 * Small glass "pebbles": sphere / torus / rounded cube floating around
 * the composition. Follow the same scene states as the knot.
 */
const PEBBLE_CFG = [
  { p: [-5.3, -1.4, -2.2], s: 0.34, shape: "sphere", color: "#eef6ff" },
  { p: [5.8, 1.9, -1.2], s: 0.5, shape: "torus", color: "#fdeef6" },
  { p: [-2.4, 3.2, -3.0], s: 0.42, shape: "cube", color: "#f1ecfb" },
] as const;

export function Pebbles({ high, reduced }: { high: boolean; reduced: boolean }) {
  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame(({ clock }) => {
    const t = sp.transform;
    const time = clock.elapsedTime;
    PEBBLE_CFG.forEach((c, idx) => {
      const g = refs.current[idx];
      if (!g) return;
      const a = easeInOut(seg(t, 0.03 + idx * 0.04, 0.3 + idx * 0.04));
      // drift outward with typing, orbit while the deck is on display
      const ang = time * 0.5 + idx * 2.4;
      const x = c.p[0] * (1 + a * 0.4) + Math.cos(ang) * 3.9 * a * seg(t, 0.5, 0.8);
      const y = c.p[1] * (1 + a * 0.3) + Math.sin(time * 0.7 + idx) * 0.4 * a;
      const z = c.p[2] * (1 + a * 0.3) + (-3.2 + Math.sin(ang) * 1.4) * a * seg(t, 0.5, 0.8);
      // ————— post-demo: the pebbles dissolve — background keeps only the circle —————
      const gone = easeInOut(seg(t, 0.74 + idx * 0.05, 0.9));
      g.position.set(x, y, z - gone * 3);
      const s = c.s * (1 - a * 0.35) * (1 - gone);
      g.scale.setScalar(Math.max(s, 0.001));
      g.visible = s > 0.02;
      if (!reduced) {
        g.rotation.x = time * 0.5 + idx;
        g.rotation.y = time * 0.34 + idx * 2;
      }
    });
  });

  const glassProps = high
    ? { roughness: 0.06, metalness: 0.08, transmission: 0.92, thickness: 0.8, ior: 1.4 }
    : { roughness: 0.12, metalness: 0.25, transmission: 0.7, thickness: 0.6, ior: 1.3 };

  return (
    <>
      {PEBBLE_CFG.map((c, i) => {
        const inner = (
          <group ref={(el) => { refs.current[i] = el; }}>
            {c.shape === "sphere" && (
              <mesh>
                <sphereGeometry args={[1, 40, 40]} />
                <meshPhysicalMaterial color={c.color} {...glassProps} transparent opacity={0.95} />
              </mesh>
            )}
            {c.shape === "torus" && (
              <mesh>
                <torusGeometry args={[0.72, 0.3, 24, 48]} />
                <meshPhysicalMaterial color={c.color} {...glassProps} transparent opacity={0.95} />
              </mesh>
            )}
            {c.shape === "cube" && (
              <RoundedBox args={[1, 1, 1]} radius={0.24} smoothness={4}>
                <meshPhysicalMaterial color={c.color} {...glassProps} transparent opacity={0.95} />
              </RoundedBox>
            )}
          </group>
        );
        return reduced ? (
          <group key={i}>{inner}</group>
        ) : (
          <Float key={i} speed={1.4} rotationIntensity={0.6} floatIntensity={0.9}>
            {inner}
          </Float>
        );
      })}
    </>
  );
}
