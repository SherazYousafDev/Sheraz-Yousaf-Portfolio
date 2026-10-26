"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { onIntro } from "@/lib/intro";
import { canRunWebGL } from "@/lib/device";
import { person } from "@/data/portfolio";

const PhotoCanvas = dynamic(() => import("@/components/webgl/photo-canvas"), { ssr: false });

/**
 * The portrait in true colour. Server-renders a plain <img> (fast LCP and the
 * fallback for low-end / reduced-motion), then on capable devices swaps in a
 * pixel-identical WebGL plane that ripples under the cursor.
 * Its entrance is choreographed by the hero timeline, not here.
 */
export function HeroPhoto({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [useGL, setUseGL] = useState(false);
  const [glReady, setGlReady] = useState(false);

  // The ripple only reacts to a hovering pointer, so touch screens keep the plain
  // photo and never download three.js. Mouse users get it after the intro settles.
  useEffect(() => {
    if (!canRunWebGL() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let idle = 0;
    const off = onIntro(() => {
      idle = window.setTimeout(() => setUseGL(true), 1200);
    });
    return () => {
      off();
      clearTimeout(idle);
    };
  }, []);

  const handleReady = useCallback(() => setGlReady(true), []);

  return (
    <div ref={box} className={`relative aspect-[422/591] ${className ?? ""}`}>
      <Image
        src={person.photo.src}
        alt={person.photo.alt}
        fill
        priority
        sizes="(min-width: 1024px) 31vw, (min-width: 768px) 40vw, 55vw"
        className={`object-contain object-bottom ${glReady ? "invisible" : ""}`}
      />
      {useGL && (
        <div className={`absolute inset-0 ${glReady ? "" : "invisible"}`}>
          <PhotoCanvas src={person.photo.src} target={box} onReady={handleReady} />
        </div>
      )}
    </div>
  );
}
