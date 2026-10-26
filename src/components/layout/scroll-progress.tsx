"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";

/** A 2px red-pen line across the top, scaled by scroll progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = gsap.quickSetter(el, "scaleX");
    let last = -1;
    const tick = () => {
      const p = scrollState.lenis ? scrollState.progress : scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (Math.abs(p - last) > 0.0005) {
        set(p);
        last = p;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  );
}
