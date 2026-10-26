"use client";

import { useRef } from "react";
import { scramble } from "@/lib/scramble";

/**
 * Text that scrambles on hover/focus of its closest interactive parent.
 * The visible text is aria-hidden; screen readers get the stable label.
 */
export function ScrambleText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cancel = useRef<() => void>(undefined);

  const run = () => {
    if (!ref.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancel.current?.();
    cancel.current = scramble(ref.current, children, { duration: 520 });
  };

  return (
    <span className={`relative inline-block ${className ?? ""}`} onPointerEnter={run} onFocus={run}>
      <span className="sr-only">{children}</span>
      {/* invisible copy reserves width so scrambling never shifts layout */}
      <span aria-hidden className="invisible">{children}</span>
      <span ref={ref} aria-hidden className="absolute inset-0 whitespace-nowrap">
        {children}
      </span>
    </span>
  );
}
