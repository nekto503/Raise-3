"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Section transition presets — more interesting than plain fade-up. */
export type RevealVariant = "up" | "blur" | "wipe" | "zoom" | "flip";

const VARIANTS: Record<RevealVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 44 },
    show: { opacity: 1, y: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(14px)", scale: 0.97 },
    show: { opacity: 1, filter: "blur(0px)", scale: 1 },
  },
  wipe: {
    hidden: { clipPath: "inset(0 0 100% 0)", y: 22 },
    show: { clipPath: "inset(0 0 0% 0)", y: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.82, rotate: -2.5 },
    show: { opacity: 1, scale: 1, rotate: 0 },
  },
  flip: {
    hidden: { opacity: 0, rotateX: -34, y: 30 },
    show: { opacity: 1, rotateX: 0, y: 0 },
  },
};

const MOVES: Record<RevealVariant, { duration: number; ease: number[] }> = {
  up: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  blur: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  wipe: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  zoom: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  flip: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
};

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
}) {
  const reduced = useUI((s) => s.reduced);

  if (reduced) {
    // reduced motion: no transform theatrics, a simple fade
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, margin: "-80px" }}
        transition={{ duration: 0.3, delay: Math.min(delay, 0.15) }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("[perspective:900px]", className)}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ ...MOVES[variant], delay }}
    >
      {children}
    </motion.div>
  );
}
