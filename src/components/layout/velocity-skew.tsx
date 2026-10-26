"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";

/**
 * Elements marked [data-velocity] lean with scroll speed (skewY), then ease
 * back to rest when scrolling stops. Applied to a wrapper-free property
 * (`skewY` via GSAP) so it composes with any entrance animation on children.
 */
export function VelocitySkew() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let els: HTMLElement[] = [];
    let setters: ((v: number) => void)[] = [];
    const collect = () => {
      els = Array.from(document.querySelectorAll<HTMLElement>("[data-velocity]"));
      setters = els.map((el) => gsap.quickSetter(el, "skewY", "deg") as (v: number) => void);
    };
    collect();
    const id = window.setTimeout(collect, 1500); // late-mounted sections

    let last = 0;
    const tick = () => {
      const skew = gsap.utils.clamp(-4, 4, scrollState.smoothVelocity * -0.12);
      if (Math.abs(skew - last) < 0.01) return;
      last = skew;
      setters.forEach((set) => set(skew));
    };
    gsap.ticker.add(tick);
    return () => {
      clearTimeout(id);
      gsap.ticker.remove(tick);
      els.forEach((el) => gsap.set(el, { skewY: 0 }));
    };
  }, []);

  return null;
}
