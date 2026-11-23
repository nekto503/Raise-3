"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Celebration burst of tiny presentation slides flying out of the center.
 * Rendered for ~2s after a successful waitlist submit.
 */
export function SlideConfetti({ fireId }: { fireId: number }) {
  const pieces = useMemo(() => {
    if (fireId <= 0) return [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const palettes = [
      "linear-gradient(135deg,#7EC8F2,#2F5BFF)",
      "linear-gradient(135deg,#FFB3D9,#FF5C8A)",
      "linear-gradient(135deg,#B9A3E8,#7EC8F2)",
      "linear-gradient(135deg,#0A0A0A,#3b3b3b)",
    ];
    return Array.from({ length: 26 }, (_, i) => ({
      x: rnd(-46, 46),
      y: rnd(8, 62),
      rot: rnd(-200, 200),
      delay: (i % 13) * 0.04,
      bg: palettes[i % 4],
      w: rnd(34, 64),
      h: rnd(22, 40),
    }));
  }, [fireId]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.div
          key={`${fireId}-${i}`}
          initial={{ x: "-50%", y: 0, left: "50%", top: "42%", scale: 0.2, opacity: 1, rotate: 0 }}
          animate={{
            x: `calc(-50% + ${p.x}vw)`,
            y: `${p.y}vh`,
            scale: 1,
            rotate: p.rot,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.7, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", width: p.w, height: p.h, background: p.bg, borderRadius: 7 }}
        />
      ))}
    </div>
  );
}
