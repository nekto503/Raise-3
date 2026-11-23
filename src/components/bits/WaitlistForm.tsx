"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const schema = z.object({
  email: z.string().regex(EMAIL_RE),
});
type Values = z.infer<typeof schema>;

type Status = { kind: "idle" | "loading" | "ok" | "dup" | "err"; position?: number };

/**
 * Waitlist form (email + button). Talks to /api/waitlist,
 * validates with zod, animates success + fires confetti through onDone.
 */
export function WaitlistForm({
  variant = "pill",
  onDone,
  className,
}: {
  variant?: "pill" | "stacked";
  onDone?: (ok: boolean) => void;
  className?: string;
}) {
  const t = useT();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: Values) => {
    if (status.kind === "loading") return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, role: "user" }),
      });
      const data = (await res.json()) as { ok: boolean; position?: number; existing?: boolean };
      if (!res.ok || !data.ok) throw new Error("request failed");
      if (data.existing) {
        setStatus({ kind: "dup" });
        playSfx("click");
        onDone?.(false);
      } else {
        setStatus({ kind: "ok", position: data.position ?? 1 });
        playSfx("success");
        onDone?.(true);
      }
    } catch {
      setStatus({ kind: "err" });
      onDone?.(false);
    }
  };

  if (status.kind === "ok" || status.kind === "dup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "glass w-full max-w-2xl rounded-[28px] px-8 py-6 text-left shadow-glass"
        )}
        role="status"
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
              status.kind === "ok" ? "bg-cobalt text-white" : "bg-marker text-ink"
            )}
            aria-hidden="true"
          >
            {status.kind === "ok" ? <Check className="size-5" /> : <ArrowRight className="size-5" />}
          </span>
          <div>
            <p className="font-heading text-xl font-bold text-ink">
              {status.kind === "ok" ? t.final.ok : t.final.dup}
            </p>
            {status.kind === "ok" && (
              <p className="mt-1 font-mono text-sm text-ink-2">
                {t.final.okSub.replace("{n}", String(status.position))}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const busy = status.kind === "loading";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t.a11y.form}
      className={cn(
        variant === "pill"
          ? "glass flex w-full max-w-2xl flex-col gap-3 rounded-[28px] p-2 shadow-glass sm:flex-row sm:items-center sm:gap-2 sm:rounded-full"
          : "flex flex-col gap-3",
        className
      )}
    >
      <div className={cn("relative flex-1", variant === "pill" && "sm:pl-4")}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.final.placeholder}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "waitlist-email-err" : undefined}
          disabled={busy}
          {...register("email")}
          className="w-full bg-transparent py-3 font-mono text-sm text-ink outline-none placeholder:text-ink-2/70 disabled:opacity-60"
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p
              id="waitlist-email-err"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-full mt-1 font-mono text-xs text-cobalt"
            >
              {t.final.invalidEmail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-cobalt px-7 py-3 font-heading text-sm font-bold text-white shadow-cobalt transition-all duration-300 hover:-translate-y-0.5 hover:bg-cobalt-deep focus-visible:outline-2 focus-visible:outline-cobalt disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t.final.sending}
          </>
        ) : (
          <>
            {t.final.button}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

/** Fired toast for error case (used by parent forms) */
export function formErrorToast(message: string) {
  toast.error(message);
}
