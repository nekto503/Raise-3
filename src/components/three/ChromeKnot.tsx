"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useRef } from "react";
import { sp } from "@/lib/store";
import { easeInOut, lerp, seg } from "@/lib/anim";

/**
 * Liquid-chrome torus knot — the brand "mascot". Parked beside the hero
 * headline, orbits lazily behind the fan while the generated deck is on
 * display, then bows out: once the demo is over the persistent background
 * keeps only the clean neural circle.
 */
export function ChromeKnot({ high, reduced }: { high: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.Material>(null!);

  const tmp = useRef({ pos: new THREE.Vector3(), orbit: new THREE.Vector3() }).current;

  useFrame(({ clock }) => {
    const g = group.current;
    const t = sp.transform;
    const time = clock.elapsedTime;

    if (!reduced) {
      g.rotation.x = time * 0.32;
      g.rotation.y = time * 0.44;
    }

    // hero position with slight cursor magnetism (bottom-right, clear of the headline)
    tmp.pos.set(5.75 + sp.mx * 0.35, -2.35 + sp.my * 0.25, -0.6);

    // park away during typing
    const a = easeInOut(seg(t, 0.03, 0.3));
    tmp.orbit.set(6.8, -3.6, -5);
    tmp.pos.lerp(tmp.orbit, a);

    // lazy orbit behind the fan while the deck is on display
    if (t > 0.5) {
      const ang = time * 0.35;
      // while the "how" panels are pinned the knot tucks deeper and tighter —
      // it stays a background figure instead of sweeping across the copy
      const how = seg(sp.how, 0.02, 0.2);
      const r = 5.1 * (1 - 0.4 * how);
      const zb = -4.6 - how * 2.6;
      tmp.orbit.set(Math.cos(ang) * r, 0.35 + Math.sin(time * 0.5) * 0.4, zb + Math.sin(ang) * 1.6);
      const b = easeInOut(seg(t, 0.5, 0.85));
      tmp.pos.lerp(tmp.orbit, b);
    }

    // ————— post-demo: sinks away and dissolves — the circle stays alone —————
    const gone = easeInOut(seg(t, 0.78, 0.92));
    tmp.pos.z -= gone * 3.5;

    g.position.copy(tmp.pos);
    const scale = (0.95 - a * 0.35) * (1 - gone);
    g.scale.setScalar(Math.max(scale, 0.001));
    g.visible = scale > 0.02;
    if (mat.current) mat.current.opacity = 1 - gone;
  });

  return (
    <group ref={group} position={[5.75, -2.35, -0.6]}>
      <mesh castShadow={false}>
        <torusKnotGeometry args={[0.62, 0.235, high ? 160 : 88, high ? 24 : 12]} />
        {high ? (
          <MeshTransmissionMaterial
            ref={mat as never}
            samples={6}
            resolution={256}
            transmission={1}
            thickness={0.6}
            roughness={0.04}
            ior={1.15}
            chromaticAberration={0.14}
            anisotropicBlur={0.5}
            distortion={0.16}
            distortionScale={0.3}
            temporalDistortion={0.22}
          />
        ) : (
          <meshPhysicalMaterial
            ref={mat as never}
            metalness={1}
            roughness={0.14}
            envMapIntensity={1.6}
            clearcoat={1}
            clearcoatRoughness={0.15}
            transparent
          />
        )}
      </mesh>
    </group>
  );
}
