/** Pulsing "available" dot. Pulse is transform/opacity only. */
export function StatusDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`relative inline-flex size-2 ${className ?? ""}`}>
      <span className="absolute inset-0 rounded-full bg-[#2fb36b] motion-safe:animate-[pulse-dot_2s_var(--ease-expo)_infinite]" />
      <span className="relative size-2 rounded-full bg-[#2fb36b]" />
    </span>
  );
}
