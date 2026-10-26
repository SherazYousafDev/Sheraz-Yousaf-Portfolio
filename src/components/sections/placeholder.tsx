import { chapters } from "@/data/portfolio";

/** Temporary chapter shells so navigation + chapter colours work during Phase 2. */
export function Placeholder({ id, chapter, start }: { id: string; chapter: "paper" | "ink" | "accent"; start?: string }) {
  const i = chapters.findIndex((c) => c.id === id);
  const c = chapters[i];
  return (
    <section id={id} data-chapter={chapter} data-chapter-start={start} className="relative flex min-h-svh flex-col justify-between px-gutter py-24 lg:pl-[calc(var(--gutter)+var(--rail))]">
      <p className="label">
        SY-{String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")} — {c?.label}
      </p>
      <h2 className="display text-[14vw] uppercase">{c?.label}</h2>
      <p className="label opacity-60">Built in phase 3</p>
    </section>
  );
}
