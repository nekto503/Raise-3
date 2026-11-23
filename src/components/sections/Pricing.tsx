"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHead } from "@/components/bits/SectionHead";
import { BorderTrail } from "@/components/core/border-trail";
import { useT } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function Pricing() {
  const t = useT();

  return (
    <section id="pricing" className="relative bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <SectionHead
          align="center"
          label={t.pricing.label}
          title={t.pricing.title}
          sub={t.pricing.sub}
          className="mb-16"
        />

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {t.pricing.plans.map((plan, i) => {
            const featured = "badge" in plan && !!plan.badge;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.85, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative flex h-full flex-col rounded-[24px] p-8",
                  featured
                    ? "bg-night text-white shadow-lift ring-1 ring-white/10"
                    : "border border-ink/[0.08] bg-white"
                )}
              >
                {featured && <BorderTrail size={70} color="#FF5C8A" duration={5} />}

                {featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-marker px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                    {plan.badge}
                  </span>
                )}

                <h3 className={cn("font-heading text-lg font-bold tracking-tight", featured ? "text-white" : "text-ink")}>
                  {plan.name}
                </h3>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight",
                      featured ? "text-white" : "text-ink"
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className={cn("font-mono text-xs", featured ? "text-white/50" : "text-ink-2")}>
                    / {plan.period}
                  </span>
                </p>
                <p className={cn("mt-2 text-sm", featured ? "text-white/60" : "text-ink-2")}>{plan.desc}</p>

                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    scrollToId("#cta");
                  }}
                  className={cn(
                    "mt-6 w-full rounded-xl py-2.5 font-heading text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-cobalt",
                    featured
                      ? "bg-white text-ink hover:bg-marker"
                      : "border border-ink/[0.12] text-ink hover:border-cobalt/40 hover:text-cobalt"
                  )}
                >
                  {plan.cta}
                </button>

                <ul className={cn("mt-6 flex-1 space-y-3 text-sm", featured ? "text-white/75" : "text-ink-2")}>
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full",
                          featured ? "bg-marker/20 text-marker" : "bg-ink/[0.07] text-ink"
                        )}
                        aria-hidden="true"
                      >
                        <Check className="size-2.5" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-mono text-xs text-ink-2">{t.pricing.note}</p>
      </div>
    </section>
  );
}
