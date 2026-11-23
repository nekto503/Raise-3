"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Bento-style tilt card: 3D tilt toward the cursor + moving spotlight.
 * Falls back to a static card for reduced motion.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useUI((s) => s.reduced);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 22, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 200, damping: 22, mass: 0.6 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
    ref.current.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    ref.current.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduced ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className={cn("group/tilt relative will-change-transform", className)}
    >
      {/* spotlight following the cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(47,91,255,0.10), rgba(255,193,46,0.05) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      {children}
    </motion.div>
  );
}
