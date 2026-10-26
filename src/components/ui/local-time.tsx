"use client";

import { useLocalTime } from "@/lib/use-local-time";
import { person } from "@/data/portfolio";

export function LocalTime({ seconds = false, className }: { seconds?: boolean; className?: string }) {
  const time = useLocalTime(person.timeZone, seconds);
  return (
    <time className={`tabular ${className ?? ""}`} suppressHydrationWarning>
      {time}
    </time>
  );
}
