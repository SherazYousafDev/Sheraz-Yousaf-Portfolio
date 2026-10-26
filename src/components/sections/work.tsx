"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollTo } from "@/lib/scroll-state";
import { chapters, projects, type Project } from "@/data/portfolio";

const pad = (n: number) => String(n).padStart(2, "0");
const slug = (p: Project) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const TRAIL_SIZE = 10;

/** Browser-window frame around a project screenshot (or a typographic poster when there is none). */
function Frame({ p, priority = false }: { p: Project; priority?: boolean }) {
  return (
    <div data-frame className="overflow-hidden border border-line bg-[color-mix(in_oklab,var(--fg)_6%,var(--bg))]">
      <div className="label flex h-7 items-center gap-3 border-b border-line px-3 normal-case tracking-normal">
        <span aria-hidden className="flex gap-1.5">
          <i className="size-2 rounded-full bg-current opacity-30" />
          <i className="size-2 rounded-full bg-current opacity-30" />
          <i className="size-2 rounded-full bg-current opacity-30" />
        </span>
        <span className="truncate opacity-70">{p.linkLabel ?? `${slug(p)} — local build`}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        {p.image ? (
          <Image
            data-shot
            src={p.image}
            alt={`${p.name} — homepage screenshot`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-top transition-transform duration-1000 ease-[var(--ease-expo)] group-hover/f:scale-[1.04]"
          />
        ) : (
          <div data-shot className="absolute inset-0 flex flex-col justify-between bg-accent p-[6%] text-[#141312]">
            <span className="label">{p.kind}</span>
            <span className="display text-[clamp(40px,7vw,120px)] leading-[0.85]">{p.name}</span>
            <span className="label">Booking · Pricing · Tracking</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Work() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      const cleanups: (() => void)[] = [];

      // ── Hover warp: a brief SVG displacement ripple across the screenshot.
      const disp = section.current?.querySelector<SVGFEDisplacementMapElement>("[data-warp-map]");
      if (disp && fine && !reduced) {
        q("[data-frame-link]").forEach((link) => {
          const shot = link.querySelector<HTMLElement>("[data-frame]");
          if (!shot) return;
          const enter = () => {
            shot.style.filter = "url(#work-warp)";
            gsap.killTweensOf(disp);
            gsap.fromTo(
              disp,
              { attr: { scale: 0 } },
              {
                attr: { scale: 38 },
                duration: 0.32,
                ease: "power2.out",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                  shot.style.filter = "";
                },
              },
            );
          };
          link.addEventListener("pointerenter", enter);
          cleanups.push(() => link.removeEventListener("pointerenter", enter));
        });
      }

      // ── Image trail over the project index (desktop pointer only).
      const items = q("[data-trail]") as HTMLElement[];
      const list = q("[data-index]")[0] as HTMLElement | undefined;
      if (list && fine && !reduced) {
        let active = -1;
        let head = 0;
        let lx = -999;
        let ly = -999;
        const rows = q("[data-index-row]") as HTMLElement[];
        rows.forEach((r, i) => {
          const on = () => (active = i);
          r.addEventListener("pointerenter", on);
          cleanups.push(() => r.removeEventListener("pointerenter", on));
        });
        const leave = () => (active = -1);
        const move = (e: PointerEvent) => {
          if (active < 0 || Math.hypot(e.clientX - lx, e.clientY - ly) < 90) return;
          lx = e.clientX;
          ly = e.clientY;
          const el = items[head];
          head = (head + 1) % items.length;
          el.querySelectorAll<HTMLElement>("[data-trail-face]").forEach((f) => (f.hidden = f.dataset.trailFace !== String(active)));
          gsap.killTweensOf(el);
          gsap
            .timeline()
            .set(el, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50, zIndex: 100 + head })
            .fromTo(el, { scale: 0.35, opacity: 1, rotate: gsap.utils.random(-9, 9) }, { scale: 1, duration: 0.55, ease: "expo.out" })
            .to(el, { scale: 0.75, opacity: 0, y: "+=50", duration: 0.6, ease: "power2.in" }, 0.45);
        };
        list.addEventListener("pointerleave", leave);
        list.addEventListener("pointermove", move);
        cleanups.push(() => {
          list.removeEventListener("pointerleave", leave);
          list.removeEventListener("pointermove", move);
        });
      }

      const mm = gsap.matchMedia();

      // ── Desktop: pinned horizontal track.
      mm.add("(min-width: 1024px)", () => {
        const stage = q("[data-hstage]")[0] as HTMLElement;
        const track = q("[data-track]")[0] as HTMLElement;
        const panels = q("[data-panel]") as HTMLElement[];
        const bar = q("[data-hbar]")[0];
        const count = q("[data-hcount]")[0];
        const distance = () => Math.max(0, track.scrollWidth - innerWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(bar, { scaleX: self.progress });
              // which project panel is closest to the viewport centre
              let idx = 0;
              const x = self.progress * distance() + innerWidth * 0.5;
              panels.forEach((p, i) => {
                if (p.offsetLeft <= x) idx = i;
              });
              if (count) count.textContent = pad(Math.max(1, idx));
            },
          },
        });

        // inside the track: screenshots settle from a slight zoom as they slide in
        if (!reduced) {
          panels.slice(1).forEach((panel) => {
            gsap.fromTo(
              panel.querySelector("[data-frame]"),
              { clipPath: "inset(0% 0% 0% 22%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "none",
                scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 95%", end: "left 35%", scrub: true },
              },
            );
            gsap.fromTo(
              panel.querySelector("[data-copy]"),
              { x: 120, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 80%", end: "left 30%", scrub: true },
              },
            );
          });
        }

        // index rows jump to their panel
        q("[data-index-row]").forEach((row, i) => {
          const go = (e: Event) => {
            e.preventDefault();
            const st = tween.scrollTrigger!;
            const target = panels[i + 1];
            const ratio = Math.min(1, target.offsetLeft / Math.max(1, distance()));
            scrollTo(st.start + ratio * (st.end - st.start));
          };
          row.addEventListener("click", go);
          cleanups.push(() => row.removeEventListener("click", go));
        });
      });

      // ── Mobile / tablet: vertical, panels wipe up into view.
      mm.add("(max-width: 1023px)", () => {
        const offs = (q("[data-index-row]") as HTMLAnchorElement[]).map((row) => {
          const go = (e: Event) => {
            e.preventDefault();
            scrollTo(row.getAttribute("href")!, { offset: -24 });
          };
          row.addEventListener("click", go);
          return () => row.removeEventListener("click", go);
        });
        cleanups.push(...offs);
        if (reduced) return;
        (q("[data-panel]") as HTMLElement[]).slice(1).forEach((panel) => {
          gsap.from(panel.querySelector("[data-frame]"), {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 85%", once: true },
          });
        });
      });

      return () => {
        cleanups.forEach((c) => c());
        mm.revert();
      };
    },
    { scope: section },
  );

  return (
    <section id="work" ref={section} data-chapter="ink" aria-labelledby="work-title" className="relative">
      {/* shared displacement filter for the hover warp */}
      <svg aria-hidden className="absolute size-0">
        <filter id="work-warp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap data-warp-map in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div data-hstage className="relative lg:h-svh lg:overflow-hidden">
        <div
          data-track
          className="flex flex-col gap-[14vh] px-gutter pb-[14vh] pt-[16vh] lg:h-full lg:w-max lg:flex-row lg:gap-0 lg:pb-0 lg:pl-[calc(var(--gutter)+var(--rail))] lg:pr-0 lg:pt-0"
        >
          {/* ── Intro panel: title + index */}
          <div data-panel className="flex shrink-0 flex-col lg:h-full lg:w-[min(48vw,820px)] lg:pb-[72px] lg:pr-[5vw] lg:pt-[100px]">
            <div className="label flex justify-between gap-4 border-b border-line pb-3">
              <span>SY-04 / {pad(chapters.length)}</span>
              <span>(Selected work)</span>
            </div>
            <h2 id="work-title" className="display mt-[5vh] text-[19vw] uppercase leading-[0.82] lg:text-[min(8.6vw,17svh)]">
              Selected <span className="serif-i normal-case text-accent">work</span>
            </h2>
            <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed opacity-70 md:text-[16px]">
              {projects.length} sites, newest first — the latest built for a client and live this year. Hover a name to preview it.
            </p>

            <ol data-index className="mt-auto border-t border-line pt-2 max-lg:mt-10">
              {projects.map((p, i) => (
                <li key={p.name}>
                  <a
                    href={`#work-${slug(p)}`}
                    data-index-row
                    data-cursor="View"
                    className="group/r grid grid-cols-[36px_1fr_auto] items-baseline gap-3 border-b border-line py-3.5 lg:py-[1.6svh]"
                  >
                    <span className="label text-accent">{pad(i + 1)}</span>
                    <span className="display text-[clamp(22px,2vw,36px)] leading-none transition-transform duration-700 ease-[var(--ease-expo)] group-hover/r:translate-x-3">
                      {p.name}
                    </span>
                    <span className="label hidden text-right opacity-60 sm:block">
                      {p.latest ? "Latest · " : ""}
                      {p.kind}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p aria-hidden className="label mt-6 hidden items-center gap-3 opacity-60 lg:flex">
              Keep scrolling <span className="inline-block h-px w-10 bg-current" /> →
            </p>
          </div>

          {/* ── Project panels */}
          {projects.map((p, i) => (
            <article
              key={p.name}
              id={`work-${slug(p)}`}
              data-panel
              aria-labelledby={`work-${slug(p)}-title`}
              className="shrink-0 lg:flex lg:h-full lg:w-[min(88vw,1500px)] lg:items-center lg:pb-[72px] lg:pr-[5vw] lg:pt-[96px]"
            >
              <div className="grid w-full grid-cols-1 gap-x-[3vw] gap-y-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      data-frame-link
                      data-cursor="Open"
                      aria-label={`Open ${p.name} (${p.linkLabel}) in a new tab`}
                      className="group/f block"
                    >
                      <Frame p={p} priority={i === 0} />
                    </a>
                  ) : (
                    <div className="group/f">
                      <Frame p={p} priority={i === 0} />
                    </div>
                  )}
                </div>

                <div data-copy className="flex flex-col lg:col-span-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="display text-[clamp(44px,4.6vw,88px)] leading-none text-accent">{pad(i + 1)}</span>
                    {p.latest && (
                      <span className="label rounded-full border border-accent px-3 py-1 text-accent">Latest · Client</span>
                    )}
                  </div>
                  <p className="label mt-4 opacity-60">
                    {p.kind} · {p.client}
                    {p.year ? ` · ${p.year}` : ""}
                  </p>
                  <h3 id={`work-${slug(p)}-title`} className="display mt-2 text-[10vw] leading-[0.92] lg:text-[min(3.5vw,6.6svh)]">
                    {p.name}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Built with">
                    {p.stack.map((t) => (
                      <li key={t} className="label rounded-full border border-line px-3 py-1.5 normal-case tracking-normal">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-5">
                    {(
                      [
                        ["Problem", p.problem],
                        ["Solution", p.solution],
                        ["Result", p.result],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[84px_1fr] gap-3 border-t border-line py-3">
                        <dt className="label pt-[3px] opacity-60">{k}</dt>
                        <dd className="text-[14px] leading-snug opacity-85 lg:text-[clamp(13px,0.95vw,15px)]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="Open"
                      className="label group/l mt-5 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--fg)] px-5 py-3 transition-colors duration-500 hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                    >
                      Visit {p.linkLabel}
                      <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-expo)] group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <p className="label mt-5 opacity-60">Live link coming soon</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* progress — desktop */}
        <div aria-hidden className="label absolute inset-x-0 bottom-0 hidden h-[60px] items-center gap-6 px-gutter lg:flex lg:pl-[calc(var(--gutter)+var(--rail))]">
          <span>
            <span data-hcount>01</span> / {pad(projects.length)}
          </span>
          <span className="relative h-px flex-1 bg-line">
            <span data-hbar className="absolute inset-0 origin-left scale-x-0 bg-[var(--fg)]" />
          </span>
          <span className="opacity-60">Scroll ↓ to move →</span>
        </div>
      </div>

      {/* image trail layer */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        {Array.from({ length: TRAIL_SIZE }, (_, k) => (
          <div key={k} data-trail className="absolute left-0 top-0 w-[260px] opacity-0 shadow-2xl">
            {projects.map((p, i) =>
              p.image ? (
                <Image
                  key={i}
                  data-trail-face={i}
                  hidden
                  src={p.image}
                  alt=""
                  width={520}
                  height={325}
                  sizes="260px"
                  className="block aspect-[16/10] w-full object-cover object-top"
                />
              ) : (
                <div key={i} data-trail-face={i} hidden className="display flex aspect-[16/10] w-full items-end bg-accent p-4 text-[28px] leading-none text-[#141312]">
                  {p.name}
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
