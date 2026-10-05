"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/components/ui";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

const INTERVAL_MS = 6000;

// Mnenja strank: ena kartica naenkrat, samodejno menjavanje, ročno s puščicami ali pikicami.
// Menjavanje se ustavi, ko je miška nad kartico ali je fokus v njej, in ga ni pri prefers-reduced-motion.
export function Testimonials() {
  const count = TESTIMONIALS.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  // index v odvisnostih: ob ročnem premiku se odštevanje začne znova.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => go(1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [count, paused, index, go]);

  if (count === 0) return null;
  const multi = count > 1;

  return (
    <section id="mnenja" className="mx-auto max-w-2xl px-5 py-8">
      <Reveal>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Kaj pravijo delodajalci
        </p>
        <div
          className="mt-4 flex items-center gap-2 sm:gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {multi && <Arrow dir="prev" onClick={() => go(-1)} />}

          {/* Vse kartice v isti celici mreže: višina = najvišja kartica, brez poskakovanja ob menjavi. */}
          <div className="grid min-w-0 flex-1" aria-live={paused ? "polite" : "off"}>
            {TESTIMONIALS.map((t, i) => (
              <Card key={t.name + t.company} t={t} active={i === index} />
            ))}
          </div>

          {multi && <Arrow dir="next" onClick={() => go(1)} />}
        </div>

        {multi && (
          <div className="mt-4 flex justify-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name + t.company}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Mnenje ${i + 1} od ${count}`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-6 bg-brand-600" : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

function Card({ t, active }: { t: Testimonial; active: boolean }) {
  return (
    <figure
      aria-hidden={!active}
      className={cn(
        "glass iris-edge sheen relative col-start-1 row-start-1 flex flex-col justify-center overflow-hidden rounded-2xl px-6 py-6 text-center transition-all duration-500 sm:px-9",
        active ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-400/25 blur-3xl" />
      <Quote className="relative mx-auto h-6 w-6 fill-brand-600/15 text-brand-600" strokeWidth={1.5} />
      <blockquote className="relative mt-3 text-base leading-relaxed text-slate-800 sm:text-lg">
        „{t.quote}“
      </blockquote>
      <figcaption className="relative mt-4 flex items-center justify-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
          {t.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-left text-sm leading-tight">
          <span className="block font-semibold text-slate-900">{t.name}</span>
          <span className="block text-slate-500">{t.company}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Prejšnje mnenje" : "Naslednje mnenje"}
      className="glass iris-edge grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 transition hover:bg-white/70 hover:text-brand-600"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
