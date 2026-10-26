"use client";

import { useEffect, useRef } from "react";
import { scramble } from "@/lib/scramble";
import { onIntro } from "@/lib/intro";

/** Cycles through roles with a scramble resolve. Static for screen readers. */
export function RoleTicker({ roles, className }: { roles: string[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let timer = 0;
    let cancel: (() => void) | undefined;
    const next = () => {
      i = (i + 1) % roles.length;
      cancel = scramble(el, roles[i], { duration: 900, chars: "abcdefghijklmnopqrstuvwxyz/_" });
      timer = window.setTimeout(next, 3200);
    };
    const off = onIntro(() => {
      el.textContent = "";
      cancel = scramble(el, roles[0], { duration: 1100, chars: "abcdefghijklmnopqrstuvwxyz/_" });
      timer = window.setTimeout(next, 3600);
    });
    return () => {
      off();
      clearTimeout(timer);
      cancel?.();
    };
  }, [roles]);

  return (
    <span className={className}>
      <span className="sr-only">{roles[0]}</span>
      <span ref={ref} aria-hidden>
        {roles[0]}
      </span>
    </span>
  );
}
