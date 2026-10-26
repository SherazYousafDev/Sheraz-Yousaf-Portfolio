const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*+=";

/**
 * Scrambles an element's text into `to`, resolving left → right.
 * Returns a cancel function. Pure DOM — no React re-renders per frame.
 */
export function scramble(el: HTMLElement, to: string, { duration = 700, chars = GLYPHS } = {}) {
  const from = el.textContent ?? "";
  const len = Math.max(from.length, to.length);
  const queue = Array.from({ length: len }, (_, i) => {
    const start = Math.floor(Math.random() * (duration * 0.35));
    const end = start + duration * 0.35 + Math.floor(Math.random() * (duration * 0.3));
    return { from: from[i] ?? "", to: to[i] ?? "", start, end, ch: "" };
  });
  let raf = 0;
  const t0 = performance.now();

  const update = (now: number) => {
    const t = now - t0;
    let out = "";
    let done = 0;
    for (const q of queue) {
      if (t >= q.end) {
        done++;
        out += q.to;
      } else if (t >= q.start) {
        if (!q.ch || Math.random() < 0.28) q.ch = chars[Math.floor(Math.random() * chars.length)];
        out += q.to === " " ? " " : q.ch;
      } else {
        out += q.from;
      }
    }
    el.textContent = out;
    if (done < queue.length) raf = requestAnimationFrame(update);
  };
  raf = requestAnimationFrame(update);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = to;
  };
}
