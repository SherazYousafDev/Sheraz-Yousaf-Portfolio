import type Lenis from "lenis";

/**
 * Shared, mutable scroll state. Written by <SmoothScroll/> every frame,
 * read inside gsap.ticker callbacks (never through React state).
 */
export const scrollState = {
  lenis: null as Lenis | null,
  velocity: 0,
  /** Smoothed velocity, eased back toward 0. Use this for skew/marquee boost. */
  smoothVelocity: 0,
  direction: 1 as 1 | -1 | 0,
  scroll: 0,
  progress: 0,
};

export function scrollTo(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const { lenis } = scrollState;
  if (lenis) {
    lenis.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (typeof el === "number") window.scrollTo({ top: el });
  else if (el instanceof HTMLElement) el.scrollIntoView({ behavior: opts.immediate ? "auto" : "smooth" });
}
