"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { introReleased, onIntro } from "@/lib/intro";

export function SmoothScroll() {
  // Web fonts change line breaks (and so every trigger position) — re-measure once they land.
  useEffect(() => {
    let alive = true;
    // Skip when the fonts were already in (the usual case, since they're preloaded).
    if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(() => alive && ScrollTrigger.refresh());
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    history.scrollRestoration = "manual";

    if (reduced) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        scrollState.scroll = scrollY;
        scrollState.progress = max > 0 ? scrollY / max : 0;
      };
      addEventListener("scroll", onScroll, { passive: true });
      return () => removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    scrollState.lenis = lenis;
    scrollTo(0, 0);
    // Hold the page still until the preloader hands over to the hero.
    let offIntro = () => {};
    if (!introReleased()) {
      lenis.stop();
      offIntro = onIntro(() => lenis.start());
    }

    lenis.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      scrollState.direction = l.direction as 1 | -1 | 0;
      scrollState.scroll = l.scroll;
      scrollState.progress = l.progress;
      ScrollTrigger.update();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      // Ease the smoothed velocity back to rest — drives skew + marquee boost.
      scrollState.smoothVelocity += (scrollState.velocity - scrollState.smoothVelocity) * 0.12;
      if (!lenis.isScrolling) scrollState.velocity *= 0.9;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      offIntro();
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, []);

  return null;
}
