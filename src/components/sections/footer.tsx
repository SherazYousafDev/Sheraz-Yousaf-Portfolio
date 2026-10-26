"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollTo } from "@/lib/scroll-state";
import { person, socials } from "@/data/portfolio";
import { LocalTime } from "@/components/ui/local-time";
import { Magnetic } from "@/components/ui/magnetic";
import { ScrambleText } from "@/components/ui/scramble-text";
import { AUDIT_EVENT } from "@/components/layout/easter-egg";

const noop = () => () => {};
/** Current year on the client only — the page is prerendered, so no Date during server render. */
const useYear = () => useSyncExternalStore(noop, () => new Date().getFullYear(), () => null);

/**
 * Sticky reveal footer. The wrapper sits in normal flow and clips a fixed
 * panel, so as the page scrolls past, the content above lifts away like a
 * curtain and the footer is uncovered from underneath.
 */
export function Footer() {
  const wrap = useRef<HTMLElement>(null);
  const follow = useRef<HTMLDivElement>(null);

  // "LET'S TALK" follows the cursor around the footer, with a lazy lerp.
  useEffect(() => {
    const el = wrap.current;
    const f = follow.current;
    if (!el || !f) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const xTo = gsap.quickTo(f, "x", { duration: 1.1, ease: "power3" });
    const yTo = gsap.quickTo(f, "y", { duration: 1.1, ease: "power3" });
    const rTo = gsap.quickTo(f, "rotate", { duration: 1.2, ease: "power3" });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(e.clientX - r.left - r.width / 2);
      yTo(e.clientY - r.top - r.height / 2);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      rTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  // Wordmark rises and the panel lifts slightly as it is uncovered.
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(wrap);
      gsap.fromTo(
        q("[data-footer-panel]"),
        { yPercent: -30 },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom bottom", scrub: true } },
      );
      gsap.from(q("[data-wordmark] > span"), {
        yPercent: 105,
        ease: "expo.out",
        duration: 1.4,
        stagger: 0.06,
        scrollTrigger: { trigger: wrap.current, start: "top 40%", once: true },
      });
    },
    { scope: wrap },
  );

  const year = useYear();
  // Touch-screen way into the easter egg: tap the name five times.
  const taps = useRef<number[]>([]);
  const onTapName = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2500), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      dispatchEvent(new Event(AUDIT_EVENT));
    }
  };

  return (
    <footer
      ref={wrap}
      data-chapter="accent"
      aria-label="Footer"
      className="relative h-svh min-h-[560px] [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
    >
      <div className="fixed inset-x-0 bottom-0 h-svh min-h-[560px]">
        <div
          data-footer-panel
          className="relative flex h-full flex-col overflow-hidden bg-accent px-gutter pb-6 pt-[88px] text-[#141312] lg:pl-[calc(var(--gutter)+var(--rail))]"
        >
          {/* the cursor-following outline CTA */}
          <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
            <div ref={follow} className="display whitespace-nowrap text-[15vw] uppercase leading-none text-transparent opacity-80 [-webkit-text-stroke:1.5px_#141312] md:text-[13vw]">
              Let’s talk
            </div>
          </div>

          <div className="label relative grid grid-cols-2 gap-x-4 gap-y-6 border-b border-[#141312]/25 pb-4 md:grid-cols-4">
            <span>(End of file)</span>
            <span className="hidden md:block">Lahore · {person.coordinates}</span>
            <span className="text-right md:text-left">
              Local <LocalTime seconds /> PKT
            </span>
            <span className="col-span-2 text-left md:col-span-1 md:text-right">
              <a href={`mailto:${person.email}`} className="link-draw normal-case">
                {person.email}
              </a>
            </span>
          </div>

          <div className="relative mt-auto flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <ul className="label flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-draw">
                    <ScrambleText>{s.label}</ScrambleText> ↗
                  </a>
                </li>
              ))}
            </ul>
            <Magnetic strength={0.35}>
              <button
                type="button"
                onClick={() => scrollTo(0)}
                className="label group/top flex items-center gap-3 rounded-full border border-[#141312] px-5 py-3 transition-colors duration-500 hover:bg-[#141312] hover:text-[var(--c-accent-bg)]"
              >
                <ScrambleText>Back to top</ScrambleText>
                <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-expo)] group-hover/top:-translate-y-1">
                  ↑
                </span>
              </button>
            </Magnetic>
          </div>

          {/* oversized wordmark, set to the full width */}
          <p
            data-wordmark
            onClick={onTapName}
            aria-label={`${person.firstName} ${person.lastName}`}
            className="display relative mt-6 flex justify-between overflow-hidden whitespace-nowrap text-[10.6vw] uppercase leading-[0.8] tracking-[-0.04em] lg:text-[min(10.4vw,22svh)]"
          >
            {`${person.firstName} ${person.lastName}`.split("").map((ch, i) => (
              <span key={i} aria-hidden className="inline-block">
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>
          <div className="label relative mt-4 flex justify-between gap-4 opacity-70">
            <span>
              © {year ?? ""} {person.firstName} {person.lastName}
            </span>
            <span className="hidden sm:inline">Designed &amp; built by hand in Lahore</span>
            <span className="hidden [@media(hover:hover)]:inline">
              Psst, type <kbd className="font-mono">sheraz</kbd>
            </span>
            <span className="[@media(hover:hover)]:hidden">Psst, tap the name 5×</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
