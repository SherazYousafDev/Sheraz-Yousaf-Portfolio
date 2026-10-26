/** The visible 12-column grid (4 on mobile). Neutral grey so it reads on every chapter. */
export function GridLines() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="px-gutter lg:pl-[calc(var(--gutter)+var(--rail))] h-full">
        <div className="grid h-full grid-cols-4 md:grid-cols-12" data-grid>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              data-grid-col
              className={`h-full origin-top border-l border-[rgba(128,128,128,.13)] last:border-r ${i >= 4 ? "hidden md:block" : ""} ${i === 3 ? "max-md:border-r" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
