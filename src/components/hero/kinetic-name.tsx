"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Particle = { el: HTMLElement; cx: number; cy: number; x: number; y: number; vx: number; vy: number; w: number; vw: number };

const BASE_W = 500;
const MAX_W = 700;
const MIN_W = 300;
/** Resting weight reads a CSS var so intro tweens (the weight wave) can drive it. */
const REST = `"wght" var(--w, ${BASE_W})`;

/**
 * One line of the name, split into glyphs. Each glyph has a hidden "ghost"
 * at base weight that reserves its width, so weight changes never reflow.
 */
export function KineticLine({
  text,
  className,
  counterIndex,
}: {
  text: string;
  className?: string;
  /** Marks the glyph whose counter becomes the zoom-through window. */
  counterIndex?: number;
}) {
  return (
    <span className={`block whitespace-nowrap ${className ?? ""}`} aria-hidden>
      {text.split("").map((ch, i) => (
        <span key={i} className="relative inline-block" data-counter={i === counterIndex ? "" : undefined}>
          <span data-intro-char className="relative inline-block">
            <span className="invisible">{ch}</span>
            <span data-live className="absolute inset-0 text-center" style={{ fontVariationSettings: REST }}>
              {ch}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Spring physics for every [data-live] glyph inside `scope`: near the
 * cursor letters swell to a heavier weight and get pushed away, then
 * spring back. Sleeps when nothing is moving.
 */
export function useKineticName(scope: React.RefObject<HTMLElement | null>, enabled: React.RefObject<boolean>) {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const root = scope.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Rest positions, relative to `root`, read from layout (offset*), so
    // they're unaffected by any transforms currently applied.
    const measure = () => {
      particles.current = Array.from(root.querySelectorAll<HTMLElement>("[data-live]")).map((el, i) => {
        const host = el.parentElement!.parentElement!;
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = host;
        while (n && n !== root) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        const prev = particles.current[i];
        return {
          el,
          cx: x + host.offsetWidth / 2,
          cy: y + host.offsetHeight / 2,
          x: prev?.x ?? 0,
          y: prev?.y ?? 0,
          vx: prev?.vx ?? 0,
          vy: prev?.vy ?? 0,
          w: prev?.w ?? BASE_W,
          vw: prev?.vw ?? 0,
        };
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const mouse = { x: -9999, y: -9999, active: false };
    const move = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") mouse.active = false;
    };
    const out = () => (mouse.active = false);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", move, { passive: true });
    addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", out);

    let settled = true;
    let fs = 100;
    const ro2 = new ResizeObserver(() => (fs = parseFloat(getComputedStyle(root).fontSize) || 100));
    ro2.observe(root);

    const tick = () => {
      const on = enabled.current && mouse.active;
      if (!on && settled) return;
      const rr = root.getBoundingClientRect();
      const radius = fs * 1.35;
      const mx = mouse.x - rr.left;
      const my = mouse.y - rr.top;
      let energy = 0;

      for (const p of particles.current) {
        let tx = 0;
        let ty = 0;
        let tw = BASE_W;
        if (on) {
          const dx = p.cx + p.x - mx;
          const dy = p.cy + p.y - my;
          const d = Math.hypot(dx, dy);
          if (d < radius) {
            const f = Math.pow(1 - d / radius, 2);
            const inv = 1 / (d || 1);
            tx = dx * inv * f * fs * 0.3;
            ty = dy * inv * f * fs * 0.2;
            tw = BASE_W + (MAX_W - BASE_W) * Math.min(1, f * 1.8);
          } else {
            tw = BASE_W - (BASE_W - MIN_W) * Math.min(1, (d - radius) / (radius * 2.5)) * 0.4;
          }
        }
        p.vx = (p.vx + (tx - p.x) * 0.11) * 0.8;
        p.vy = (p.vy + (ty - p.y) * 0.11) * 0.8;
        p.vw = (p.vw + (tw - p.w) * 0.14) * 0.74;
        p.x += p.vx;
        p.y += p.vy;
        p.w += p.vw;
        energy += Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.vw) * 0.05 + Math.abs(p.x) * 0.02 + Math.abs(p.w - BASE_W) * 0.01;
        p.el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${(p.vx * 0.35).toFixed(2)}deg)`;
        p.el.style.fontVariationSettings = `"wght" ${p.w.toFixed(1)}`;
      }

      settled = !on && energy < 0.05;
      if (settled) {
        for (const p of particles.current) {
          p.x = p.y = p.vx = p.vy = p.vw = 0;
          p.w = BASE_W;
          p.el.style.transform = "";
          p.el.style.fontVariationSettings = REST;
        }
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      ro2.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", move);
      removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", out);
    };
  }, [scope, enabled]);
}
