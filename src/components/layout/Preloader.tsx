"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { useT } from "@/lib/i18n";

/**
 * Glass-cube preloader (~1.4s first visit, quick fade on repeat visits).
 * Rendered in the server HTML: the site never starts before the
 * preloader — the opaque overlay covers everything from first paint
 * until `ready` flips and the exit slide runs.
 */
export function Preloader() {
  const t = useT();
  const ready = useUI((s) => s.ready);
  const setReady = useUI((s) => s.setReady);
  const reduced = useUI((s) => s.reduced);

  useEffect(() => {
    let seen = false;
    try {
      seen =
        sessionStorage.getItem("raise3-seen") === "1" ||
        sessionStorage.getItem("slaide-seen") === "1";
    } catch {
      /* private mode */
    }
    const delay = seen ? 350 : 1450;
    if (reduced) {
      setReady(true);
      try {
        sessionStorage.setItem("raise3-seen", "1");
      } catch {
        /* noop */
      }
      return;
    }
    const id = window.setTimeout(() => {
      setReady(true);
      try {
        sessionStorage.setItem("raise3-seen", "1");
      } catch {
        /* noop */
      }
    }, delay);
    return () => {
      window.clearTimeout(id);
    };
  }, [setReady, reduced]);

  if (ready && reduced) return null;

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-paper"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-label={t.preloader.loading}
          role="status"
        >
          <div className="cube-wrap">
            <div className="cube">
              <div className="cube-face" style={{ transform: "translateZ(42px)" }} />
              <div className="cube-face" style={{ transform: "rotateY(180deg) translateZ(42px)" }} />
              <div className="cube-face" style={{ transform: "rotateY(90deg) translateZ(42px)" }} />
              <div className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(42px)" }} />
              <div className="cube-face" style={{ transform: "rotateX(90deg) translateZ(42px)" }} />
              <div className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(42px)" }} />
            </div>
          </div>

          <motion.p
            className="mt-8 font-display text-4xl font-bold tracking-tight text-ink"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {t.preloader.wordmark}
          </motion.p>

          <motion.p
            className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-ink-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {t.preloader.loading}
          </motion.p>

          {/* bottom status line */}
          <div className="absolute bottom-8 left-8 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2/60 md:block">
            init deck-7
          </div>
          <div className="absolute bottom-8 right-8 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2/60 md:block">
            ok · go
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
