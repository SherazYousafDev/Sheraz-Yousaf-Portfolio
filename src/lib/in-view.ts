import type { gsap } from "gsap";

/**
 * Plays a GSAP animation the first time `el` crosses `start` (ScrollTrigger-style
 * "top 85%"). One-shot reveals use this instead of ScrollTrigger: an
 * IntersectionObserver costs nothing when ScrollTrigger refreshes, which keeps
 * layout work off the main thread on phones.
 */
export function playInView<T extends gsap.core.Animation>(anim: T, el: Element | null | undefined, start = "top 85%"): T {
  anim.pause();
  if (!el) {
    anim.play();
    return anim;
  }
  const pct = Number(start.match(/(\d+)%/)?.[1] ?? 85);
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      anim.play();
    },
    { rootMargin: `0px 0px -${100 - pct}% 0px` },
  );
  io.observe(el);
  return anim;
}
