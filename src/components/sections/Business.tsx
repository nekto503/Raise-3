"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHead } from "@/components/bits/SectionHead";
import { Reveal } from "@/components/bits/Reveal";
import { useT } from "@/lib/i18n";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PARTNERS = ["NORDWIND", "Rooster Capital", "AERO LABS", "DECK.ONE", "hype&co", "Mint Fund", "Vector Partners"];

const schema = z.object({
  name: z.string().min(2),
  email: z.string().regex(EMAIL_RE),
  role: z.enum(["user", "investor", "partner"]),
  message: z.string().max(1000).optional(),
});
type Values = z.infer<typeof schema>;

export function Business() {
  const t = useT();
  return (
    <section id="business" className="relative bg-paper px-4 py-24 md:px-8 md:py-32">
      {/* the investor insert — deep black, one restrained pink breath */}
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[32px] bg-night px-6 py-12 text-white md:px-12 md:py-16">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-glow-pink/10 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-44 -left-32 h-[26rem] w-[26rem] rounded-full bg-glow-pink/[0.07] blur-[110px]" aria-hidden="true" />

        {/* items-start: the form stands at the same top level as the headline
            and the stat cards — nothing floats lower than its neighbour */}
        <div className="relative grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          {/* ——— left: headline with the key numbers right beside it, then the
           monetization strip in a single line, then the partners ——— */}
          <div>
            <div className="flex flex-col gap-8 md:flex-row md:items-stretch md:justify-between">
              <SectionHead
                align="left"
                dark
                label={t.business.label}
                title={t.business.title}
                sub={t.business.sub}
                className="max-w-md"
              />

              {/* the two key market stats — right next to the headline,
               stretched to its full height so nothing hangs empty */}
              <div className="grid shrink-0 grid-cols-2 gap-3 md:w-[330px]">
                {t.business.stats.slice(0, 2).map((s, i) => (
                  <Reveal key={s.label} variant="zoom" delay={i * 0.08} className="h-full">
                    <div className="glass-liquid-dark flex h-full flex-col justify-center rounded-2xl p-4 md:p-5">
                      <p className="font-display text-3xl font-bold tracking-tight text-marker md:text-4xl">{s.value}</p>
                      <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-white/50">{s.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* monetization — all four cards in one line, side by side */}
            <div className="mt-10">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                <TrendingUp className="size-3.5 text-marker" aria-hidden="true" />
                {t.business.moneyTitle}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {t.business.money.map((m, i) => (
                  <Reveal key={m.title} variant="blur" delay={i * 0.06}>
                    <div className="glass-liquid-dark h-full rounded-xl p-4">
                      <p className="font-heading text-sm font-bold text-white">{m.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">{m.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* partners — a quiet static row, nothing drifting to infinity */}
            <div className="mt-9">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">{t.business.partnersLabel}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                {PARTNERS.map((p) => (
                  <span key={p} className="font-display text-base font-bold tracking-wide text-white/35">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ——— right: contact form ——— */}
          <BusinessForm />
        </div>
      </div>
    </section>
  );
}

function BusinessForm() {
  const t = useT();
  const f = t.business.form;
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: "investor" },
  });

  const role = watch("role");

  const onSubmit = async (values: Values) => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok: boolean };
      if (!res.ok || !data.ok) throw new Error();
      setStatus("ok");
      playSfx("success");
      toast.success(f.ok);
    } catch {
      setStatus("err");
      toast.error(f.err);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 font-mono text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-glow-pink/60 focus:bg-white/10 focus-visible:outline-2 focus-visible:outline-glow-pink";

  if (status === "ok") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark flex h-fit flex-col items-center justify-center gap-4 self-start rounded-[24px] px-8 py-16 text-center"
        role="status"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-marker text-ink">
          <Send className="size-6" aria-hidden="true" />
        </span>
        <p className="font-heading text-2xl font-bold">{f.ok}</p>
        <a
          href="mailto:hello@raise3.ai?subject=Investor%20deck"
          className="font-mono text-sm text-glow-pink underline underline-offset-4 hover:text-white"
        >
          {f.deck}
        </a>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={f.title}
      className="glass-dark h-fit self-start rounded-[24px] p-7 md:p-8"
    >
      <h3 className="font-heading text-2xl font-extrabold tracking-tight">{f.title}</h3>
      <p className="mt-1 text-sm text-white/60">{f.sub}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="bf-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {f.name}
          </label>
          <input id="bf-name" type="text" autoComplete="name" className={cn(inputCls, "mt-1.5")} {...register("name")} />
          {errors.name && <p className="mt-1 font-mono text-xs text-marker">{f.name}?</p>}
        </div>

        <div>
          <label htmlFor="bf-email" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {f.email}
          </label>
          <input id="bf-email" type="email" autoComplete="email" className={cn(inputCls, "mt-1.5")} {...register("email")} />
          {errors.email && <p className="mt-1 font-mono text-xs text-marker">{f.err}</p>}
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{f.role}</span>
          <Select value={role} onValueChange={(v) => setValue("role", v as Values["role"])}>
            <SelectTrigger className="mt-1.5 w-full rounded-xl border-white/15 bg-white/[0.06] font-mono text-sm text-white">
              <SelectValue placeholder={f.role} />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-night text-white">
              {f.roles.map((r) => (
                <SelectItem key={r.value} value={r.value} className="font-mono text-sm text-white focus:bg-white/10 focus:text-white">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="bf-msg" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {f.message}
          </label>
          <textarea
            id="bf-msg"
            rows={3}
            placeholder={f.placeholderMessage}
            className={cn(inputCls, "mt-1.5 resize-none")}
            {...register("message")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-heading text-sm font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-marker hover:shadow-marker focus-visible:outline-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {f.sending}
            </>
          ) : (
            <>
              <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              {f.submit}
            </>
          )}
        </button>

        <a
          href="mailto:hello@raise3.ai?subject=Investor%20deck"
          className="block text-center font-mono text-xs text-glow-pink underline underline-offset-4 transition-colors hover:text-white"
        >
          {f.deck}
        </a>
      </div>
    </form>
  );
}
