"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHead } from "@/components/bits/SectionHead";
import { Reveal } from "@/components/bits/Reveal";
import { useT } from "@/lib/i18n";

export function Faq() {
  const t = useT();

  return (
    <section id="faq" className="relative bg-paper py-24 md:py-36">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <SectionHead
          align="center"
          label={t.faq.label}
          title={t.faq.title}
        />

        <Reveal variant="flip" className="mt-14">
          <Accordion type="single" collapsible className="hairline rounded-[24px]">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-b border-ink/[0.07] px-2 last:border-b-0 md:px-4">
                <AccordionTrigger className="gap-6 py-6 font-heading text-lg font-bold tracking-tight text-ink hover:no-underline md:text-xl [&>svg]:size-5 [&>svg]:text-ink-2">
                  <span className="flex items-baseline gap-4 text-left">
                    <span className="font-mono text-xs text-ink-2/60">{String(i + 1).padStart(2, "0")}</span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-9 pr-2 text-base leading-relaxed text-ink-2 md:pl-11">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
