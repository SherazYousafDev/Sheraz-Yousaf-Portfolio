"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { scramble } from "@/lib/scramble";
import { chapters, person } from "@/data/portfolio";

const pad = (n: number) => String(n).padStart(2, "0");

/** Vertical editorial rail on the left edge (desktop): chapter index + coordinates. */
export function Rail() {
  const idx = useRef<HTMLSpanElement>(null);
  const name = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let triggers: ScrollTrigger[] = [];
    const id = requestAnimationFrame(() => {
      triggers = chapters.map((c, i) =>
        ScrollTrigger.create({
          trigger: `#${c.id}`,
          start: "top 50%",
          end: "bottom 50%",
          refreshPriority: -1,
          onToggle: (self) => {
            if (!self.isActive || !idx.current || !name.current) return;
            scramble(idx.current, pad(i + 1), { duration: 450 });
            scramble(name.current, c.label.toUpperCase(), { duration: 600 });
          },
        }),
      );
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <aside
      aria-hidden
      data-intro="rail"
      className="ui pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-[calc(var(--gutter)+var(--rail))] lg:block"
    >
      <div className="absolute inset-y-0 right-0 border-r border-line" />
      <div className="label absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-6 whitespace-nowrap">
        <span>
          SY <span ref={idx}>01</span> / {pad(chapters.length)}
        </span>
        <span className="h-px w-10 bg-current opacity-50" />
        <span ref={name}>INDEX</span>
        <span className="h-px w-10 bg-current opacity-50" />
        <span className="opacity-60">{person.coordinates}</span>
      </div>
    </aside>
  );
}
