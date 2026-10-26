"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { releaseIntro } from "@/lib/intro";
import { person } from "@/data/portfolio";

const LOG = ["Loading catalog", "Validating SKUs", "Checking bolt patterns", "Reconciling TireGuru", "Rendering portfolio"];
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

/**
 * First-visit preloader: an odometer that rolls 000 → 100 while a fake
 * "audit log" ticks off, then exits through a double curtain (ink, then
 * red-pen) into the hero. Skipped on repeat visits within the session.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const seen = document.documentElement.classList.contains("seen");
    if (!el || seen) {
      const id = requestAnimationFrame(releaseIntro);
      return () => cancelAnimationFrame(id);
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = Array.from(el.querySelectorAll<HTMLElement>("[data-col]"));
    const logs = Array.from(el.querySelectorAll<HTMLElement>("[data-log]"));
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const curtain2 = el.querySelector<HTMLElement>("[data-curtain2]");

    // Odometer: units roll continuously; tens/hundreds only roll during the last unit.
    const render = (v: number) => {
      const units = v % 10;
      const tens = (Math.floor(v / 10) % 10) + Math.max(0, (v % 10) - 9);
      const hundreds = Math.floor(v / 100) + Math.max(0, (v % 100) - 99);
      [hundreds, tens, units].forEach((d, i) => {
        if (cols[i]) cols[i].style.transform = `translate3d(0, ${(-d * 100) / DIGITS.length}%, 0)`;
      });
      if (bar) bar.style.transform = `scaleX(${v / 100})`;
      logs.forEach((l, i) => {
        if (v >= (i + 1) * 19 && !l.dataset.done) {
          l.dataset.done = "1";
          gsap.to(l.querySelector("[data-ok]"), { opacity: 1, duration: 0.2 });
          gsap.fromTo(l, { opacity: 0.35 }, { opacity: 1, duration: 0.3 });
        }
      });
    };

    const counter = { v: 0 };
    const assetsReady = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => (document.readyState === "complete" ? r(0) : addEventListener("load", r, { once: true }))),
    ]);

    const tl = gsap.timeline({ paused: true });
    tl.to(counter, {
      v: 100,
      duration: reduced ? 0.4 : 2.6,
      ease: "power2.inOut",
      onUpdate: () => render(counter.v),
    })
      .to(el.querySelectorAll("[data-pl-fade]"), { opacity: 0, y: -12, duration: 0.5, stagger: 0.04, ease: "power3.in" }, "+=0.15")
      .to(el.querySelector("[data-digits]"), { yPercent: -105, duration: 0.8, ease: "curtain" }, "<")
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: reduced ? 0.3 : 1.1, ease: "curtain" }, "-=0.25")
      .to(curtain2, { clipPath: "inset(0% 0% 100% 0%)", duration: reduced ? 0.3 : 1.1, ease: "curtain" }, "-=0.95")
      .add(() => releaseIntro(), "-=1.05")
      .add(() => {
        (el.parentElement ?? el).style.display = "none";
        try {
          sessionStorage.setItem("sy-seen", "1");
        } catch {}
      });

    // Hold just before 100 until fonts + images are in, then finish.
    let alive = true;
    tl.play();
    tl.addPause(2.2 * (reduced ? 0.15 : 1), () => {
      assetsReady.then(() => {
        if (alive) tl.play();
      });
    });

    return () => {
      alive = false;
      tl.kill();
    };
  }, []);

  return (
    <div data-preloader aria-hidden className="fixed inset-0 z-[150]">
      {/* second curtain: a red-pen slab that trails the first */}
      <div data-curtain2 className="absolute inset-0 bg-accent" style={{ clipPath: "inset(0% 0% 0% 0%)" }} />
      <div
        ref={root}
        className="absolute inset-0 flex flex-col justify-between bg-[#141312] px-gutter py-6 text-[#eeebe4] dark:bg-[#ff5b2e] dark:text-[#0c0b0a]"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div className="flex items-start justify-between" data-pl-fade>
          <span className="display text-[28px] tracking-[-0.04em]">SY</span>
          <span className="label text-right">
            {person.firstName} {person.lastName} · Portfolio ’26
            <br />
            <span className="opacity-60">{person.coordinates}</span>
          </span>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <ul className="label flex flex-col gap-1.5" data-pl-fade>
            {LOG.map((l) => (
              <li key={l} data-log className="flex w-[260px] items-center gap-2 opacity-35">
                <span>›</span>
                <span>{l}</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap opacity-40">..........................</span>
                <span data-ok className="opacity-0">
                  OK
                </span>
              </li>
            ))}
          </ul>

          <div className="overflow-hidden">
            <div data-digits className="display flex text-[34vw] leading-[0.78] tracking-[-0.05em] md:text-[24vw]">
              {[0, 1, 2].map((i) => (
                <span key={i} className="relative block h-[0.78em] overflow-hidden" style={{ width: i === 0 ? "0.5em" : "0.62em" }}>
                  <span data-col className="absolute inset-x-0 top-0 flex flex-col will-change-transform">
                    {DIGITS.map((d, j) => (
                      <span key={j} className="block h-[0.78em] text-center tabular">
                        {d}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative h-px w-full bg-current/20" data-pl-fade>
          <div data-bar className="absolute inset-0 origin-left scale-x-0 bg-current" />
        </div>
      </div>
    </div>
  );
}
