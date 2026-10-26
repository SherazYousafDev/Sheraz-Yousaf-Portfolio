"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scramble } from "@/lib/scramble";
import { certifications, chapters, education } from "@/data/portfolio";

const pad = (n: number) => String(n).padStart(2, "0");
/** "Aug 2023 — May 2025" → ["2023", "2025"] */
const years = (period: string) => period.match(/\d{4}/g) ?? [];

export function Education() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(section);

      q("[data-edu-row]").forEach((row) => {
        const yearEls = row.querySelectorAll<HTMLElement>("[data-year]");
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
          .from(row.querySelector("[data-edu-rule]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.2, ease: "curtain" })
          .fromTo(
            row.querySelectorAll("[data-edu-wipe]"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.out", stagger: 0.08 },
            0.2,
          )
          .add(() => yearEls.forEach((y) => scramble(y, y.dataset.year!, { duration: 800, chars: "0123456789" })), 0.25);
      });

      gsap.fromTo(q("[data-cert]"), {
        y: 40,
        rotate: (i: number) => [-6, 4, -3][i % 3],
        opacity: 0,
      }, {
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: 1.1,
        ease: "back.out(1.6)",
        stagger: 0.1,
        scrollTrigger: { trigger: q("[data-certs]")[0], start: "top 88%", once: true },
      });
    },
    { scope: section },
  );

  return (
    <section
      id="education"
      ref={section}
      data-chapter="paper"
      aria-labelledby="education-title"
      className="relative px-gutter pb-[16vh] pt-[18vh] lg:pl-[calc(var(--gutter)+var(--rail))]"
    >
      <div className="label grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:grid-cols-12">
        <span className="col-span-2 whitespace-nowrap">SY-06 / {pad(chapters.length)}</span>
        <span className="hidden md:col-span-3 md:col-start-3 md:block">(Education) — the transcript</span>
        <span className="col-span-2 col-start-3 text-right md:col-span-3 md:col-start-10">
          {education.length} degrees · {certifications.length} certificates
        </span>
      </div>

      <div className="grid grid-cols-4 gap-x-4 gap-y-12 pt-[6vh] md:grid-cols-12">
        {/* Title column — sticky beside the rows on desktop */}
        <div className="col-span-4 md:col-span-4">
          <div className="md:sticky md:top-[120px]">
            <h2 id="education-title" data-velocity className="display text-[15vw] uppercase leading-[0.85] md:text-[min(6.6vw,14svh)]">
              Studied
              <br />
              <span className="serif-i normal-case text-accent">&amp; certified</span>
            </h2>
            <p className="mt-6 max-w-[30ch] text-[15px] leading-relaxed opacity-70">
              Computer science first, then information technology — with short courses in JavaScript, databases and Python along the way.
            </p>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8">
          <ol>
            {education.map((e, i) => {
              const [from, to] = years(e.period);
              return (
                <li key={e.degree} data-edu-row className="relative grid grid-cols-4 gap-x-4 py-7 md:grid-cols-8 md:py-9">
                  <span data-edu-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-[var(--fg)]" />
                  <span className="label col-span-4 mb-3 text-accent md:col-span-1 md:mb-0 md:pt-3">{pad(i + 1)}</span>
                  <div data-edu-wipe className="col-span-4 md:col-span-4">
                    <h3 className="display text-[clamp(26px,2.6vw,44px)] leading-[1]">{e.degree}</h3>
                    <p className="serif-i mt-2 text-[clamp(20px,1.7vw,28px)] leading-tight opacity-80">{e.school}</p>
                  </div>
                  <p data-edu-wipe className="col-span-4 mt-4 md:col-span-3 md:mt-0 md:text-right">
                    <span className="display block text-[clamp(30px,3.2vw,54px)] leading-none tabular">
                      <span data-year={from}>{from}</span>
                      <span className="opacity-40"> — </span>
                      <span data-year={to}>{to}</span>
                    </span>
                    <span className="label mt-2 block opacity-60">{e.period}</span>
                  </p>
                </li>
              );
            })}
          </ol>

          <div data-certs className="border-t border-[var(--fg)] pt-7">
            <p className="label mb-5 opacity-60">(Certificates)</p>
            <ul className="flex flex-wrap gap-3">
              {certifications.map((c, i) => (
                <li key={c.name} data-cert /* GSAP animates the li; the hover tilt lives on the inner box so they never fight over transform */>
                  <div className="flex items-center gap-3 rounded-[6px] border-[1.5px] border-[var(--fg)] px-4 py-3 transition-transform duration-500 ease-[var(--ease-expo)] hover:-rotate-2 hover:scale-[1.03]">
                    <span className="label grid size-7 place-items-center rounded-full bg-accent text-[#141312]">{pad(i + 1)}</span>
                    <span>
                      <span className="block text-[15px] leading-tight md:text-[16px]">{c.name}</span>
                      <span className="label opacity-60">{c.issuer}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
