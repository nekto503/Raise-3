"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { sp, useUI } from "@/lib/store";
import { easeInOut, seg } from "@/lib/anim";

/**
 * The neural-network core: transmission shell + emissive core + additive glow
 * sprite. The pink/blue orbital rings were removed for good — the ball now
 * stays completely clean while the network works and after the deck has
 * merged back in.
 */

export function GlowSphere({
  high,
  glowTex,
}: {
  high: boolean;
  glowTex: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null!);
  const sprMat = useRef<THREE.SpriteMaterial>(null!);
  const reduced = useRef(false);

  useEffect(() => {
    // keep the motion preference readable inside the frame loop
    reduced.current = useUI.getState().reduced;
    const unsub = useUI.subscribe((s, prev) => {
      if (s.reduced !== prev.reduced) reduced.current = s.reduced;
    });
    return () => unsub();
  }, []);

  const tmp = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() }).current;

  useFrame(({ clock }) => {
    const g = group.current;
    const t = sp.transform;
    const f = sp.final;
    const time = clock.elapsedTime;

    // ————— timeline —————
    const a = easeInOut(seg(t, 0.04, 0.22)); // appears with the typing window
    const think = seg(t, 0.24, 0.4); // the query is being absorbed
    const absorb = Math.sin(Math.PI * seg(t, 0.28, 0.38)); // query arrival beat
    const launch = Math.sin(Math.PI * seg(t, 0.38, 0.58)); // the deck blooms out of the core
    const feeding = Math.sin(Math.PI * seg(t, 0.82, 0.98)); // the deck sweeps back in
    const cd = easeInOut(seg(t, 0.9, 1)); // drifts into its closing perch
    const fi = easeInOut(seg(f, 0.04, 0.6)); // returns as the final-CTA hero

    // position: demo -> closing perch -> final CTA hero
    tmp.pos.set(0, 0.35, -2.2);
    tmp.target.set(0, 2.1, -4.3);
    tmp.pos.lerp(tmp.target, cd);
    tmp.target.set(0, 0.4, -1.9);
    tmp.pos.lerp(tmp.target, fi);
    g.position.copy(tmp.pos);

    // scale: base + heartbeat pulses
    let scale = a * (1 - cd * 0.12) + fi * 1.35;
    scale *= 1 + Math.sin(time * 6.2) * 0.07 * think * (1 - fi);
    scale *= 1 + 0.1 * absorb;
    scale *= 1 - 0.14 * launch; // contracts as it flings the files out
    scale *= 1 + 0.16 * feeding; // swells as the deck merges back in
    scale *= 1 + Math.sin(time * 1.3) * 0.02 * fi;
    g.scale.setScalar(Math.max(scale, 0.001));
    g.visible = scale > 0.02;

    // emissive core pulse
    if (core.current) {
      const cs = 0.42 * (1 + Math.sin(time * 7.5) * 0.12 * think) * (1 - fi * 0.3);
      core.current.scale.setScalar(Math.max(cs, 0.001));
    }
    if (coreMat.current) {
      coreMat.current.opacity = 0.55 + think * 0.35 + feeding * 0.25 + fi * 0.3;
    }
    if (sprMat.current) {
      sprMat.current.opacity = Math.min(
        1,
        seg(t, 0.2, 0.3) * 0.3 + think * 0.7 + feeding * 0.55 + fi * 0.95
      );
    }
  });

  return (
    <group ref={group} scale={0.001}>
      <mesh>
        <sphereGeometry args={[0.95, 64, 64]} />
        {high ? (
          <MeshTransmissionMaterial
            samples={6}
            resolution={256}
            transmission={1}
            thickness={1.5}
            roughness={0.06}
            ior={1.45}
            chromaticAberration={0.07}
            anisotropicBlur={0.35}
            distortion={0.32}
            distortionScale={0.5}
            temporalDistortion={0.12}
          />
        ) : (
          <meshPhysicalMaterial
            transmission={0.96}
            thickness={1.4}
            roughness={0.12}
            ior={1.4}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.3}
          />
        )}
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={coreMat} color="#cfe4ff" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <sprite scale={[5.6, 5.6, 1]}>
        <spriteMaterial
          ref={sprMat}
          map={glowTex}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}
