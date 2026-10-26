"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { chapters, experience } from "@/data/portfolio";
import { RevealText } from "@/components/ui/reveal-text";

const pad = (n: number) => String(n).padStart(2, "0");
const yearOf = (period: string) => period.match(/\d{4}/)?.[0] ?? "";
/** Height of the folder tab each earlier sheet leaves visible (desktop stack). */
const TAB = 34;

export function Experience() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = q("[data-sheet]") as HTMLElement[];
      const markers = q("[data-marker]") as HTMLElement[];

      const setActive = (i: number) => {
        cards.forEach((c, j) => c.toggleAttribute("data-active", j === i));
        markers.forEach((m, j) => m.toggleAttribute("data-active", j === i));
      };

      if (reduced) {
        cards.forEach((c) => c.setAttribute("data-active", ""));
        return;
      }

      const mm = gsap.matchMedia();

      // ── Desktop: one pin; sheets slide up over each other like a filing stack.
      mm.add("(min-width: 1024px)", () => {
        const n = cards.length;
        const rail = gsap.quickSetter(q("[data-rail-progress]"), "scaleY");
        rail(0);
        gsap.set(cards.slice(1), { yPercent: 115 });
        setActive(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: q("[data-stage]")[0],
            start: "top top",
            end: () => `+=${innerHeight * (n - 1) * 0.9 + innerHeight * 0.5}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              rail(self.progress);
              const t = self.progress * tl.duration();
              setActive(Math.min(n - 1, Math.floor(t + 0.45)));
            },
          },
        });

        for (let i = 1; i < n; i++) {
          const at = i - 1;
          tl.to(cards[i], { yPercent: 0, duration: 1 }, at);
          // every sheet already underneath sinks a little further back
          for (let k = 0; k < i; k++) {
            const depth = i - k;
            tl.to(cards[k], { scale: 1 - depth * 0.045, duration: 1 }, at);
            tl.to(cards[k].querySelector("[data-shade]"), { opacity: Math.min(0.55, depth * 0.3), duration: 1 }, at);
          }
        }
        tl.to({}, { duration: 0.5 });

        return () => setActive(-1);
      });

      // ── Mobile / tablet: normal flow, line draws, each sheet audits as it arrives.
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          q("[data-flow-progress]"),
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: q("[data-list]")[0], start: "top 70%", end: "bottom 70%", scrub: 0.5 } },
        );
        const triggers = cards.map((c, i) =>
          ScrollTrigger.create({
            trigger: c,
            start: "top 65%",
            end: "bottom 35%",
            onToggle: (self) => self.isActive && setActive(i),
          }),
        );
        cards.forEach((c) =>
          gsap.from(c, {
            clipPath: "inset(0% 0% 100% 0%)",
            y: 60,
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: c, start: "top 88%", once: true },
          }),
        );
        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="experience"
      ref={section}
      data-chapter="paper"
      aria-labelledby="experience-title"
      className="relative px-gutter pt-[18vh] lg:pl-[calc(var(--gutter)+var(--rail))]"
    >
      {/* ── Header */}
      <div className="label grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:grid-cols-12">
        <span className="col-span-2 whitespace-nowrap">
          SY-03 / {pad(chapters.length)}
        </span>
        <span className="hidden md:col-span-3 md:col-start-3 md:block">(Experience) — the paper trail</span>
        <span className="col-span-2 col-start-3 whitespace-nowrap text-right md:col-span-3 md:col-start-10">
          <span className="hidden sm:inline">{experience.length} roles · </span>
          {yearOf(experience.at(-1)!.period)} → now
        </span>
      </div>
      <div className="grid grid-cols-4 items-end gap-x-4 pb-[6vh] pt-[5vh] md:grid-cols-12">
        <RevealText as="h2" className="display col-span-4 text-[17vw] uppercase md:col-span-9 md:text-[min(10.5vw,20svh)]">
          <span id="experience-title">
            Where I’ve <span className="serif-i normal-case text-accent">worked</span>
          </span>
        </RevealText>
        <p className="col-span-4 mt-6 max-w-[34ch] text-[15px] leading-relaxed opacity-70 md:col-span-3 md:mt-0 md:pb-[1.2vw]">
          Newest first. A data role now, frontend before it — the same habit of checking every detail twice.
        </p>
      </div>

      {/* ── Stage (pinned on desktop) */}
      <div data-stage className="relative grid grid-cols-4 gap-x-4 pb-[12vh] md:grid-cols-12 lg:h-svh lg:pb-0">
        {/* Timeline rail — desktop */}
        <aside aria-hidden className="relative hidden lg:col-span-3 lg:block">
          <div className="absolute bottom-12 left-[7px] top-[110px] w-px bg-line">
            <div data-rail-progress className="absolute inset-0 origin-top bg-[var(--fg)]" />
          </div>
          <ol className="absolute bottom-12 left-0 right-4 top-[110px] flex flex-col justify-between">
            {experience.map((e) => (
              <li
                key={e.company}
                data-marker
                className="group/m relative pl-8 opacity-35 transition-opacity duration-700 ease-[var(--ease-curtain)] data-[active]:opacity-100"
              >
                <span className="absolute left-0 top-[0.55em] size-[15px] rounded-full border border-[var(--fg)] bg-[var(--bg)] transition-colors duration-500 group-data-[active]/m:border-accent group-data-[active]/m:bg-accent" />
                <span className="display block text-[clamp(36px,3.4vw,64px)] leading-none">{yearOf(e.period)}</span>
                <span className="label mt-2 block">{e.company}</span>
              </li>
            ))}
          </ol>
        </aside>

        {/* Sheets */}
        <ol data-list className="relative col-span-4 flex flex-col gap-8 pl-6 md:col-span-12 lg:col-span-9 lg:block lg:h-full lg:pl-0">
          {/* mobile timeline line */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-line lg:hidden">
            <span data-flow-progress className="absolute inset-0 origin-top bg-[var(--fg)]" />
          </span>

          {experience.map((e, i) => (
            <li
              key={e.company}
              data-sheet
              className="group/s relative origin-top lg:absolute lg:inset-x-0 lg:bottom-12 lg:top-[var(--stack-top)]"
              style={{ ["--stack-top" as string]: `${110 + i * TAB}px` }}
            >
              <article className="relative flex h-full flex-col overflow-hidden border border-line bg-[color-mix(in_oklab,var(--fg)_3.5%,var(--bg))]">
                {/* folder tab */}
                <header className="label flex h-[34px] shrink-0 items-center justify-between gap-4 border-b border-line px-4 md:px-6">
                  <span className="truncate">
                    Sheet {pad(i + 1)}/{pad(experience.length)} · {e.company} · {e.location}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {e.current && <span className="rounded-[3px] border border-accent px-1.5 py-[1px] text-accent">Current</span>}
                    <span className="hidden sm:inline">{e.period}</span>
                  </span>
                </header>

                <div className="relative z-[1] grid flex-1 grid-cols-1 gap-8 p-4 md:grid-cols-9 md:p-6 lg:min-h-0 lg:p-[clamp(20px,2.2vw,40px)]">
                  <div className="flex flex-col md:col-span-4">
                    <span className="label mb-3 sm:hidden">{e.period}</span>
                    <h3 className="display text-[11vw] leading-[0.9] md:text-[min(4.8vw,8.5svh)]">{e.role}</h3>
                    <p className="serif-i mt-2 text-[clamp(26px,2.6vw,46px)] leading-none text-accent">{e.company}</p>
                    <p className="mt-5 max-w-[32ch] text-[15px] leading-relaxed opacity-75 md:text-[16px]">{e.summary}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-6" aria-label="Tools">
                      {e.tags.map((t) => (
                        <li key={t} className="label rounded-full border border-line px-3 py-1.5 normal-case tracking-normal">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ul className="flex flex-col gap-3 md:col-span-5 lg:justify-center" aria-label={`${e.role} at ${e.company} — responsibilities`}>
                    {e.points.map((p, j) => (
                      <li
                        key={j}
                        className="grid grid-cols-[18px_1fr] gap-3 text-[14px] leading-snug opacity-70 transition-opacity duration-500 group-hover/s:opacity-100 group-data-[active]/s:opacity-100 md:text-[clamp(13px,0.98vw,16px)]"
                        style={{ transitionDelay: `${j * 60}ms` }}
                      >
                        {/* audit checkbox: the tick draws in (clip-path) when the sheet is on top or hovered */}
                        <span aria-hidden className="relative mt-[2px] size-[16px] border border-current/50">
                          <svg
                            viewBox="0 0 16 16"
                            className="absolute -inset-[3px] size-[22px] text-accent transition-[clip-path] duration-500 ease-[var(--ease-curtain)] [clip-path:inset(0_100%_0_0)] group-hover/s:[clip-path:inset(0_0_0_0)] group-data-[active]/s:[clip-path:inset(0_0_0_0)]"
                            style={{ transitionDelay: `${120 + j * 90}ms` }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="square"
                          >
                            <path d="M3 8.5 6.5 12 13 4" />
                          </svg>
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* oversized sheet number, sits in the empty corner */}
                <span
                  aria-hidden
                  className="display pointer-events-none absolute -bottom-[0.12em] right-[0.04em] hidden select-none text-[min(17vw,34svh)] leading-none text-[var(--fg)] opacity-[0.06] md:block"
                >
                  {pad(i + 1)}
                </span>

                {/* shade that darkens sheets once newer ones cover them */}
                <span data-shade aria-hidden className="pointer-events-none absolute inset-0 z-[2] bg-[#0a0908] opacity-0" />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
