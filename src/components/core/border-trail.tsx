"use client";

import { motion, useAnimationFrame, useMotionTemplate, useMotionValue } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/store";

interface BorderTrailProps {
  className?: string;
  /** angular size of the comet tail, degrees (0–360) */
  size?: number;
  color?: string;
  /** seconds per full revolution */
  duration?: number;
  /** inline style applied to the trail layer (e.g. a glow) */
  style?: CSSProperties;
}

/**
 * A glowing comet travelling around the border of the parent element.
 * Uses a rotating conic gradient masked down to a 1.5px ring —
 * no extra DOM painting, works with any border-radius.
 */
export function BorderTrail({
  className,
  size = 90,
  color = "#FF5C8A",
  duration = 4.6,
  style,
}: BorderTrailProps) {
  const reduced = useUI((s) => s.reduced);
  const angle = useMotionValue(0);

  useAnimationFrame((time) => {
    if (reduced) return;
    const cycle = (time / (duration * 1000)) % 1;
    angle.set(cycle * 360);
  });

  const tail = Math.max(8, Math.min(300, size));
  const background = useMotionTemplate`conic-gradient(from ${angle}deg, transparent 0deg, transparent ${
    360 - tail
  }deg, ${color} ${360 - Math.max(2, tail * 0.22)}deg, ${color} 359.4deg, transparent 360deg)`;

  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        ...style,
        padding: "1.5px",
        background,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
