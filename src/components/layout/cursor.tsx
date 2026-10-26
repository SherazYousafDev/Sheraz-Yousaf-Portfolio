"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Dot + ring cursor. The pair uses mix-blend-mode: difference so it reads on
 * every chapter colour; over anything with [data-cursor="Label"] the ring
 * hands over to a red label bubble. Fine pointers only, never for reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    const b = bubble.current!;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    const bx = gsap.quickTo(b, "x", { duration: 0.35, ease: "power3" });
    const by = gsap.quickTo(b, "y", { duration: 0.35, ease: "power3" });

    let shown = false;
    let label = "";
    let hover = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([d, r, b], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      bx(e.clientX);
      by(e.clientY);
    };

    const setState = (nextLabel: string, nextHover: boolean) => {
      if (nextLabel === label && nextHover === hover) return;
      label = nextLabel;
      hover = nextHover;
      if (label) {
        if (text.current) text.current.textContent = label;
        gsap.to(b, { scale: 1, duration: 0.5, ease: "expo.out", overwrite: true });
        gsap.to(r, { scale: 0.4, opacity: 0, duration: 0.3, overwrite: true });
        gsap.to(d, { scale: 0, duration: 0.25, overwrite: true });
      } else {
        gsap.to(b, { scale: 0, duration: 0.35, ease: "power3.in", overwrite: true });
        gsap.to(r, { scale: hover ? 1.9 : 1, opacity: 1, duration: 0.5, ease: "expo.out", overwrite: true });
        gsap.to(d, { scale: hover ? 0 : 1, duration: 0.3, overwrite: true });
      }
    };

    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button, [role='button'], label, summary");
      setState(labelled?.dataset.cursor ?? "", !!interactive);
    };

    const down = () => gsap.to(r, { scale: "-=0.25", duration: 0.15 });
    const up = () => gsap.to(r, { scale: hover ? 1.9 : 1, duration: 0.4, ease: "expo.out" });
    const leave = () => {
      shown = false;
      gsap.to([d, r, b], { opacity: 0, duration: 0.2 });
      gsap.set(b, { scale: 0 });
      label = "";
    };
    const enter = () => gsap.set(b, { opacity: 1 });

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerenter", enter);

    return () => {
      root.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerenter", enter);
    };
  }, []);

  // Two separate fixed layers: a z-indexed wrapper would isolate the blend
  // and the difference effect would only see an empty layer.
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[160] hidden mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block">
        <div ref={ring} className="absolute left-0 top-0 -ml-[18px] -mt-[18px] size-9 rounded-full border border-white opacity-0" />
        <div ref={dot} className="absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-white opacity-0" />
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[161] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <div
          ref={bubble}
          className="label absolute left-0 top-0 -ml-[44px] -mt-[44px] grid size-[88px] scale-0 place-items-center rounded-full bg-accent text-[#141312]"
        >
          <span ref={text} />
        </div>
      </div>
    </>
  );
}
