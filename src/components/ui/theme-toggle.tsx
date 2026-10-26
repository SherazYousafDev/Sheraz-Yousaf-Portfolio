"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

const noop = () => () => {};

/**
 * Theme switch with a circular reveal from the button.
 * View Transitions API where available; clip-path overlay fallback otherwise.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const btn = useRef<HTMLButtonElement>(null);
  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next;
      root.style.colorScheme = next;
      setTheme(next);
    };

    const r = btn.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth - 40;
    const y = r ? r.top + r.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return apply();

    if (document.startViewTransition) {
      const vt = document.startViewTransition(() => flushSync(apply));
      vt.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 900, easing: "cubic-bezier(0.76, 0, 0.24, 1)", pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => {});
      return;
    }

    // Fallback: a plate in the next theme's paper colour wipes open, then we swap.
    const plate = document.createElement("div");
    plate.style.cssText = `position:fixed;inset:0;z-index:300;pointer-events:none;background:${next === "dark" ? "#0c0b0a" : "#eeebe4"};clip-path:circle(0px at ${x}px ${y}px)`;
    document.body.appendChild(plate);
    const a = plate.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
    );
    a.onfinish = () => {
      apply();
      plate.animate({ opacity: [1, 0] }, { duration: 350, fill: "forwards" }).onfinish = () => plate.remove();
    };
  };

  return (
    <button
      ref={btn}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`group relative grid size-9 place-items-center rounded-full border border-line ${className ?? ""}`}
    >
      <span className="relative block size-3.5 overflow-hidden rounded-full border border-current">
        <span
          className="absolute inset-y-0 right-0 w-1/2 bg-current transition-transform duration-700 ease-[var(--ease-curtain)] group-hover:rotate-180"
          style={{ transformOrigin: "0% 50%" }}
        />
      </span>
    </button>
  );
}
