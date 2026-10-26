"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";

type Props = {
  items: string[];
  /** 1 = moves left, -1 = moves right. */
  direction?: 1 | -1;
  /** Pixels per second at rest. */
  speed?: number;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
};

/**
 * Infinite marquee driven by the GSAP ticker (transform only).
 * Slows to a crawl on hover, speeds up and skews with scroll velocity,
 * pauses while off-screen, and stays still for reduced motion.
 */
/** Eight-point asterisk — drawn, so it never depends on a font having the glyph. */
const Asterisk = () => (
  <svg viewBox="0 0 24 24" className="size-[0.3em]" fill="none" stroke="var(--fg)" strokeWidth="2.6" strokeLinecap="square">
    <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
  </svg>
);

export function Marquee({ items, direction = 1, speed = 70, className, itemClassName, separator = <Asterisk /> }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let half = tr.scrollWidth / 2;
    let hover = 1;
    let hoverTarget = 1;
    let visible = false;
    const setX = gsap.quickSetter(tr, "x", "px");
    const setSkew = gsap.quickSetter(tr, "skewX", "deg");

    const ro = new ResizeObserver(() => (half = tr.scrollWidth / 2));
    ro.observe(tr);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);

    const slow = () => (hoverTarget = 0.18);
    const fast = () => (hoverTarget = 1);
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", fast);

    const tick = (_t: number, dt: number) => {
      if (!visible || half <= 0) return;
      hover += (hoverTarget - hover) * 0.06;
      const v = scrollState.smoothVelocity;
      // scroll velocity boosts speed in the row's own direction, then eases back
      const boost = 1 + Math.min(Math.abs(v) * 0.09, 6);
      x -= direction * speed * hover * boost * (dt / 1000);
      x = ((x % half) + half) % half - half; // wrap into [-half, 0)
      setX(x);
      setSkew(gsap.utils.clamp(-8, 8, -v * 0.25 * direction));
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", fast);
    };
  }, [direction, speed]);

  // Two identical halves so the wrap is seamless.
  const run = (copy: number) =>
    items.map((it, i) => (
      // the item class sits on the wrapper so the separator scales with the type
      <span key={`${copy}-${i}`} className={`flex shrink-0 items-center ${itemClassName ?? ""}`}>
        <span>{it}</span>
        <span aria-hidden className="mx-[0.3em] inline-flex items-center">
          {separator}
        </span>
      </span>
    ));

  return (
    <div ref={root} aria-hidden className={`overflow-hidden ${className ?? ""}`}>
      <div ref={track} className="flex w-max will-change-transform">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
