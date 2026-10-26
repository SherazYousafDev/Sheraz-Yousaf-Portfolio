/** Film grain. A static SVG noise tile, jittered with transform-only keyframes. */
const noise = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.2'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" style={{ opacity: "var(--grain-opacity)" }}>
      <div
        className="absolute -inset-[50%] motion-safe:animate-[grain_.9s_steps(6)_infinite]"
        style={{ backgroundImage: noise, backgroundSize: "220px 220px" }}
      />
      <style>{`@keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-6%,4%)}40%{transform:translate(4%,-7%)}60%{transform:translate(-3%,8%)}80%{transform:translate(7%,2%)}100%{transform:translate(0,0)}}`}</style>
    </div>
  );
}
