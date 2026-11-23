"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useUI } from "@/lib/store";

const SELECTOR = "a, button, [role='button'], input, select, textarea, label, [data-cursor]";

/** Custom cursor: ink dot + trailing ring, grows on interactive elements. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);
  const reduced = useUI((s) => s.reduced);

  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduced) return;
    const rafId = requestAnimationFrame(() => setEnabled(true));
    document.documentElement.classList.add("custom-cursor");

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      setHovering(!!target?.closest?.(SELECTOR));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    const tick = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.16;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <div
        ref={ring}
        className={`fixed left-0 top-0 size-9 rounded-full border transition-[width,height,border-color,background-color] duration-300 ${
          hovering ? "size-14 border-cobalt/70 bg-cobalt/[0.06]" : "border-ink/25"
        } ${down ? "scale-75" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={dot}
        className={`fixed left-0 top-0 size-1.5 rounded-full transition-colors duration-200 ${hovering ? "bg-cobalt" : "bg-ink"}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

/** Thin gradient scroll progress line pinned to the very top. */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[45] h-[3px] origin-left bg-gradient-to-r from-glow-sky via-glow-pink to-glow-violet"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
