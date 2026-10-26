"use client";

import { useEffect, useState } from "react";

const fmt = (tz: string, seconds: boolean) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hour12: false,
  });

/** Live clock for a time zone. Renders "--:--" on the server to avoid hydration mismatches. */
export function useLocalTime(timeZone: string, seconds = false) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const f = fmt(timeZone, seconds);
    const tick = () => setTime(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timeZone, seconds]);

  return time ?? (seconds ? "--:--:--" : "--:--");
}
