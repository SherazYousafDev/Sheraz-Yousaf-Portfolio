"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { playInView } from "@/lib/in-view";

type Props = {
  children: React.ReactNode;
  as?: "p" | "h2" | "h3" | "span" | "div";
  className?: string;
  /** Seconds between lines. */
  stagger?: number;
  delay?: number;
  start?: string;
};

/**
 * Lines slide up out of their own masks when the block scrolls into view.
 * Re-splits on resize/font load (autoSplit), so line breaks stay correct.
 */
export function RevealText({ children, as: Tag = "p", className, stagger = 0.09, delay = 0, start = "top 85%" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let revealed = false;
      SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        aria: "none",
        autoSplit: true,
        linesClass: "reveal-line",
        onSplit: (self) => {
          const tween = gsap.from(self.lines, {
            yPercent: 110,
            rotate: 2,
            transformOrigin: "0% 100%",
            duration: 1.3,
            ease: "expo.out",
            stagger,
            delay,
            onStart: () => {
              revealed = true;
            },
          });
          // autoSplit re-splits on resize: once seen, new lines land in place instead of replaying.
          return revealed ? tween.progress(1) : playInView(tween, ref.current, start);
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
