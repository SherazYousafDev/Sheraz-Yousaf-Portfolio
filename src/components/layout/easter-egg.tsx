"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const WORD = "sheraz";
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const DURATION = 6500;
/** Fired by other components (e.g. tapping the footer name 5× on touch screens). */
export const AUDIT_EVENT = "sy:audit";

const ISSUES = [
  "SKU-0412 ✓",
  "Bolt 5×114.3 ✓",
  "Offset +35 ✓",
  "CB 73.1 ✓",
  "Image link ✓",
  "Price synced ✓",
  "Duplicate merged ✓",
  "Searchable ✓",
  "Finish: Gloss Black ✓",
  "Size 18×8.5 ✓",
];

/**
 * Hidden "audit mode": red-pen outlines over the page, SKU tags popping up
 * everywhere and a stamp slamming down. Ends on its own or with Escape.
 */
export function EasterEgg() {
  const [on, setOn] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  const start = useCallback(() => {
    if (document.documentElement.classList.contains("audit-mode")) return;
    setOn(true);
  }, []);

  // Key sequences
  useEffect(() => {
    let typed = "";
    let konami = 0;
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === "escape") return setOn(false);
      typed = (typed + k).slice(-WORD.length);
      konami = k === KONAMI[konami] ? konami + 1 : k === KONAMI[0] ? 1 : 0;
      if (typed === WORD || konami === KONAMI.length) {
        typed = "";
        konami = 0;
        start();
      }
    };
    addEventListener("keydown", key);
    addEventListener(AUDIT_EVENT, start);
    console.log("%cSY%c  Psst — type “sheraz” anywhere on the page.", "background:#e5401a;color:#141312;padding:2px 6px;font-weight:700", "color:inherit");
    return () => {
      removeEventListener("keydown", key);
      removeEventListener(AUDIT_EVENT, start);
    };
  }, [start]);

  // Play / tear down
  useEffect(() => {
    const root = document.documentElement;
    const el = layer.current;
    if (!on || !el) {
      root.classList.remove("audit-mode");
      return;
    }
    root.classList.add("audit-mode");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tags = Array.from(el.querySelectorAll<HTMLElement>("[data-tag]"));
    const stamp = el.querySelector<HTMLElement>("[data-stamp]");
    const tl = gsap.timeline();
    tl.fromTo(el.querySelector("[data-scan]"), { yPercent: -100 }, { yPercent: 100, duration: reduced ? 0 : 1.4, ease: "power2.inOut" });
    tags.forEach((t, i) => {
      gsap.set(t, { left: `${gsap.utils.random(4, 80)}%`, top: `${gsap.utils.random(10, 85)}%`, rotate: gsap.utils.random(-14, 14) });
      tl.fromTo(t, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.5)" }, 0.2 + i * 0.12);
    });
    // Shake <main>, never <body>: a transform on body would re-anchor every fixed layer (this one included).
    const main = document.getElementById("main");
    tl.fromTo(stamp, { scale: 3, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: -12, duration: 0.55, ease: "back.out(2)" }, 1.1).fromTo(
      main,
      { x: 0 },
      { x: 6, duration: 0.05, repeat: 5, yoyo: true, ease: "none", clearProps: "x" },
      1.4,
    );
    timer.current = window.setTimeout(() => setOn(false), DURATION);
    return () => {
      clearTimeout(timer.current);
      tl.kill();
      if (main) gsap.set(main, { clearProps: "x" });
      root.classList.remove("audit-mode");
    };
  }, [on]);

  return (
    <div
      ref={layer}
      role={on ? "status" : undefined}
      aria-live="polite"
      className={`pointer-events-none fixed inset-0 z-[140] overflow-hidden ${on ? "" : "hidden"}`}
    >
      {on && (
        <>
          <span className="sr-only">Audit mode: every record on this page passed the audit.</span>
          {/* scanning bar */}
          <div data-scan aria-hidden className="absolute inset-x-0 top-0 h-full">
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-accent shadow-[0_0_40px_8px_rgba(229,64,26,.45)]" />
          </div>
          {ISSUES.map((t) => (
            <span
              key={t}
              data-tag
              aria-hidden
              className="label absolute rounded-[4px] border-[1.5px] border-accent bg-[var(--c-paper-bg)] px-2.5 py-1 text-accent shadow-lg"
            >
              {t}
            </span>
          ))}
          <div className="absolute inset-0 grid place-items-center" aria-hidden>
            <div
              data-stamp
              className="flex flex-col items-center rounded-[14px] border-[5px] border-accent bg-[color-mix(in_oklab,var(--c-paper-bg)_88%,transparent)] px-[4vw] py-[2.5vw] text-center text-accent"
            >
              <span className="display text-[clamp(44px,8vw,140px)] leading-[0.85]">100% data quality</span>
              <span className="label mt-3 text-[13px] tracking-[0.3em]">✓ Audited by SY — every record verified</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
