export type Chapter = "paper" | "ink" | "accent";

type Cb = (c: Chapter) => void;
const listeners = new Set<Cb>();
let current: Chapter = "paper";

/** Fixed UI (nav, rail) follows the chapter currently under the viewport. */
export function setChapter(c: Chapter) {
  if (c === current) return;
  current = c;
  document.documentElement.dataset.chapter = c;
  listeners.forEach((cb) => cb(c));
}

export function onChapter(cb: Cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const getChapter = () => current;
