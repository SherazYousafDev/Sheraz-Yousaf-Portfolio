"use client";

import { scrollTo } from "@/lib/scroll-state";

const TEXT = "Open to work ✳ Data Analyst ✳ Lahore ✳ ";

/** Spinning circular badge that links to the contact chapter. */
export function OpenBadge({ className }: { className?: string }) {
  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        scrollTo("#contact");
      }}
      aria-label="Open to work — get in touch"
      className={`group grid aspect-square place-items-center rounded-full bg-[var(--c-paper-fg)] text-[var(--c-paper-bg)] ${className ?? ""}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="col-start-1 row-start-1 size-full motion-safe:animate-[spin_14s_linear_infinite] group-hover:[animation-duration:4s]">
        <defs>
          <path id="badge-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current font-mono text-[8.6px] uppercase">
          {/* textLength fits the phrase exactly once around the circle (2π·37 ≈ 232) */}
          <textPath href="#badge-circle" textLength="230" lengthAdjust="spacing">
            {TEXT}
          </textPath>
        </text>
      </svg>
      <span
        aria-hidden
        className="col-start-1 row-start-1 grid size-[34%] place-items-center rounded-full bg-accent text-[#141312] transition-transform duration-500 ease-[var(--ease-curtain)] group-hover:rotate-[-45deg] group-hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="size-1/2" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18 18 6M8 6h10v10" />
        </svg>
      </span>
    </a>
  );
}
