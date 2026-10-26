"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";

type Side = "top" | "right" | "bottom" | "left";

/** Which edge of `el` the pointer crossed, judged by the nearest edge to the entry/exit point. */
function edgeOf(el: HTMLElement, e: React.PointerEvent): Side {
  const r = el.getBoundingClientRect();
  const d = { top: e.clientY - r.top, bottom: r.bottom - e.clientY, left: e.clientX - r.left, right: r.right - e.clientX };
  return (Object.keys(d) as Side[]).reduce((a, b) => (d[a] < d[b] ? a : b));
}

const HIDDEN: Record<Side, string> = {
  top: "inset(0% 0% 100% 0%)",
  bottom: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode };

/**
 * A link whose fill wipes in from the edge the cursor entered,
 * and wipes out through the edge it leaves by.
 */
export function WipeButton({ children, className, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const enter = (e: React.PointerEvent) => {
    if (!ref.current || !fill.current) return;
    gsap.fromTo(
      fill.current,
      { clipPath: HIDDEN[edgeOf(ref.current, e)] },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "curtain", overwrite: true },
    );
  };
  const leave = (e: React.PointerEvent) => {
    if (!ref.current || !fill.current) return;
    gsap.to(fill.current, { clipPath: HIDDEN[edgeOf(ref.current, e)], duration: 0.5, ease: "curtain", overwrite: true });
  };

  return (
    <a
      ref={ref}
      onPointerEnter={enter}
      onPointerLeave={leave}
      className={`group/w relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full border border-[var(--fg)] ${className ?? ""}`}
      {...rest}
    >
      <span
        ref={fill}
        aria-hidden
        className="absolute inset-0 -z-10 bg-[var(--fg)]"
        style={{ clipPath: HIDDEN.bottom }}
      />
      <span className="relative transition-colors duration-300 group-hover/w:text-[var(--bg)]">{children}</span>
    </a>
  );
}
