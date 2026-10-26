"use client";

import { useRef } from "react";
import { playInView } from "@/lib/in-view";
import { gsap, useGSAP } from "@/lib/gsap";
import { chapters, skills } from "@/data/portfolio";
import { Marquee } from "@/components/ui/marquee";

const pad = (n: number) => String(n).padStart(2, "0");

export function Stack() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(section);

      // Marquee rows slide in from opposite sides as the chapter arrives.
      playInView(
        gsap.from(q("[data-row]"), {
          xPercent: (i) => (i === 0 ? 30 : -30),
          opacity: 0,
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.1,
        }),
        q("[data-rows]")[0],
        "top 85%",
      );

      // Index table: rules draw, then each group's items cascade in.
      q("[data-group]").forEach((g, gi) => {
        const tl = gsap.timeline({ delay: gi * 0.08 });
        tl.from(g.querySelector("[data-group-rule]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.1, ease: "curtain" })
          .from(g.querySelectorAll("[data-group-head] > *"), { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.05 }, 0.2)
          .from(g.querySelectorAll("[data-skill]"), { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.035 }, 0.3);
        playInView(tl, g, "top 85%");
      });
    },
    { scope: section },
  );

  const total = skills.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section
      id="stack"
      ref={section}
      data-chapter="accent"
      aria-labelledby="stack-title"
      className="relative overflow-hidden pb-[16vh] pt-[16vh]"
    >
      <div className="px-gutter lg:pl-[calc(var(--gutter)+var(--rail))]">
        <div className="label grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:grid-cols-12">
          <span className="col-span-2 whitespace-nowrap">SY 06 / {pad(chapters.length)}</span>
          <span className="hidden md:col-span-3 md:col-start-3 md:block">(Stack) Tools of the trade</span>
          <span className="col-span-2 col-start-3 whitespace-nowrap text-right md:col-span-3 md:col-start-10">
            {total} entries<span className="hidden sm:inline"> · {skills.groups.length} groups</span>
          </span>
        </div>
        <div className="grid grid-cols-4 items-end gap-x-4 pt-[5vh] md:grid-cols-12">
          <h2 id="stack-title" data-velocity className="display col-span-4 text-[16vw] uppercase md:col-span-8 md:text-[min(9.5vw,18svh)]">
            The <span className="serif-i normal-case">toolkit</span>
          </h2>
          <p className="col-span-4 mt-6 max-w-[34ch] text-[15px] leading-relaxed md:col-span-4 md:mt-0 md:pb-[1vw]">
            Spreadsheets and catalog systems by day, React and Tailwind from before. Hover a row to slow it down.
          </p>
        </div>
      </div>

      {/* ── Marquees (decorative — the index below is the readable list) */}
      <div data-rows aria-hidden className="mt-[8vh] flex flex-col border-y border-line">
        <div data-row className="border-b border-line py-[1.2vh]">
          <Marquee
            items={skills.marqueeTop}
            direction={1}
            speed={80}
            itemClassName="display text-[15vw] uppercase leading-[0.95] md:text-[min(10vw,19svh)]"
          />
        </div>
        <div data-row className="py-[1.2vh]">
          <Marquee
            items={skills.marqueeBottom}
            direction={-1}
            speed={65}
            itemClassName="serif-i text-[16vw] leading-[1.02] text-transparent [-webkit-text-stroke:1.5px_var(--fg)] md:text-[min(10.5vw,20svh)]"
          />
        </div>
      </div>

      {/* ── Grouped index */}
      <div className="mt-[12vh] grid grid-cols-1 gap-x-[2vw] gap-y-12 px-gutter sm:grid-cols-2 lg:grid-cols-4 lg:pl-[calc(var(--gutter)+var(--rail))]">
        {skills.groups.map((g, gi) => (
          <div key={g.title} data-group className="relative">
            <span data-group-rule aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-[var(--fg)]" />
            <div data-group-head className="flex items-baseline justify-between overflow-hidden pt-4">
              <h3 className="display text-[clamp(24px,2vw,34px)] leading-none">{g.title}</h3>
              <span className="label shrink-0 whitespace-nowrap pl-3">
                {pad(gi + 1)} · ({pad(g.items.length)})
              </span>
            </div>
            <ul className="mt-5">
              {g.items.map((it) => (
                <li key={it} className="overflow-hidden border-b border-line">
                  <span
                    data-skill
                    className="group/k flex items-baseline justify-between py-2.5 text-[16px] md:text-[clamp(15px,1.1vw,19px)]"
                  >
                    <span className="transition-transform duration-500 ease-[var(--ease-expo)] group-hover/k:translate-x-2">{it}</span>
                    <span aria-hidden className="label opacity-0 transition-opacity duration-300 group-hover/k:opacity-100">
                      ✓
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
