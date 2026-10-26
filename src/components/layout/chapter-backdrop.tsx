"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setChapter, type Chapter } from "@/lib/chapter";

const CHAPTERS: Chapter[] = ["paper", "ink", "accent"];

/**
 * Three fixed colour plates. As each [data-chapter] section crosses the
 * middle of the viewport we crossfade to its plate (opacity only), so the
 * page reads as chapters while sections themselves stay transparent.
 */
export function ChapterBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plates = new Map<Chapter, HTMLElement>();
    ref.current?.querySelectorAll<HTMLElement>("[data-plate]").forEach((el) => plates.set(el.dataset.plate as Chapter, el));

    const show = (c: Chapter) => {
      setChapter(c);
      plates.forEach((el, key) => gsap.to(el, { opacity: key === c ? 1 : 0, duration: 0.9, ease: "curtain", overwrite: true }));
    };

    let triggers: ScrollTrigger[] = [];
    const build = () => {
      triggers.forEach((t) => t.kill());
      triggers = Array.from(document.querySelectorAll<HTMLElement>("main [data-chapter]")).map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: section.dataset.chapterStart ?? "top 50%",
          end: "bottom 50%",
          // Measure after every pin (hero zoom, manifesto…) has added its
          // scroll distance — otherwise chapters switch mid-section.
          refreshPriority: -1,
          onToggle: (self) => self.isActive && show(section.dataset.chapter as Chapter),
        }),
      );
    };
    // Sections mount in the same commit; wait a frame so pins exist first.
    const id = requestAnimationFrame(() => {
      build();
      ScrollTrigger.sort();
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {CHAPTERS.map((c) => (
        <div
          key={c}
          data-plate={c}
          className="absolute inset-0"
          style={{ background: `var(--c-${c}-bg)`, opacity: c === "paper" ? 1 : 0 }}
        />
      ))}
      {/* Cinematic vignette — only visible in dark mode. */}
      <div
        data-vignette
        className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-curtain)]"
        style={{
          opacity: "var(--vignette)",
          background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.55) 100%)",
        }}
      />
    </div>
  );
}
