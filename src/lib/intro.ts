/**
 * Tiny event bus for the page-load choreography.
 * The preloader (or, on repeat visits, the layout) calls `releaseIntro()`;
 * every component that has an entrance waits on `onIntro()`.
 */
type Cb = () => void;

let released = false;
const listeners = new Set<Cb>();

export function releaseIntro() {
  if (released) return;
  released = true;
  document.documentElement.classList.add("intro-ready");
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onIntro(cb: Cb): () => void {
  if (released) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const introReleased = () => released;
