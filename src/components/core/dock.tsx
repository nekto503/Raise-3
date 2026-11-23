"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/store";

/**
 * Apple-style magnifying dock: icons grow as the cursor approaches.
 * Dock injects a shared `mouseX` motion value into each DockItem.
 */
export function Dock({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const mouseX = useMotionValue<number>(Infinity);

  const rendered = Children.map(children, (child) => {
    if (isValidElement(child) && typeof child.type === "function") {
      // only custom components (DockItem) receive the shared mouse position —
      // plain DOM children like separators must not get the prop
      return cloneElement(child as ReactElement<{ mouseX?: MotionValue<number> }>, { mouseX });
    }
    return child;
  });

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("flex items-end gap-1.5 rounded-2xl", className)}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {rendered}
    </motion.div>
  );
}

export function DockItem({
  mouseX,
  className,
  children,
  onClick,
  title,
  ariaLabel,
  style,
}: {
  mouseX?: MotionValue<number>;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useUI((s) => s.reduced);
  const fallback = useMotionValue<number>(Infinity);

  const distance = useTransform(mouseX ?? fallback, (val: number) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return 1000;
    return val - (b.x + b.width / 2);
  });

  const widthSync = useTransform(distance, [-110, 0, 110], [40, 74, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 210, damping: 15 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className={cn(
        "group relative aspect-square cursor-pointer rounded-full border border-ink/[0.06] bg-white/85 text-ink shadow-soft transition-colors duration-300 hover:border-ink/15 hover:bg-white focus-visible:outline-2 focus-visible:outline-cobalt",
        className
      )}
      style={reduced ? { width: 40, ...style } : { width, ...style }}
    >
      {children}
    </motion.button>
  );
}

export function DockLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-ink/[0.08] bg-white/95 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink opacity-0 shadow-soft backdrop-blur transition-all duration-200 group-hover:-top-11 group-hover:opacity-100"
      )}
    >
      {children}
    </span>
  );
}

export function DockIcon({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("flex h-full w-full items-center justify-center p-[22%]", className)}>{children}</span>;
}
