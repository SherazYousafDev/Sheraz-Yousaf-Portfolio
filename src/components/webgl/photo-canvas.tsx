"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { TRAIL, fragment, vertex } from "./photo-shader";

export type PhotoCanvasProps = {
  src: string;
  /** Element whose bounds map to the photo UVs (pointer tracking). */
  target: React.RefObject<HTMLElement | null>;
  onReady?: () => void;
};

function PhotoPlane({ src, target, onReady }: PhotoCanvasProps) {
  const { invalidate, size } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const state = useRef({
    mouse: new THREE.Vector2(0.5, 0.5),
    last: new THREE.Vector2(0.5, 0.5),
    dir: new THREE.Vector2(0, 0),
    vel: 0,
    trail: Array.from({ length: TRAIL }, () => new THREE.Vector3(0, 0, 0)),
    head: 0,
    visible: true,
  });

  const initialUniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uVel: { value: 0 },
      uAspect: { value: 1 },
      uDir: { value: new THREE.Vector2(0, 0) },
      uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3()) },
    }),
    [],
  );
  type U = typeof initialUniforms;
  // All per-frame mutation goes through the live material, not the memo.
  const live = useCallback(() => mat.current?.uniforms as U | undefined, []);

  // Texture — kept in raw sRGB (no colour-space conversion) so it matches the <img>.
  useEffect(() => {
    let disposed = false;
    new THREE.TextureLoader().load(src, (tex) => {
      if (disposed) return tex.dispose();
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      const u = live();
      if (u) u.uTex.value = tex;
      invalidate();
      // Wait one frame so the first draw is on screen before we swap.
      requestAnimationFrame(() => onReady?.());
    });
    return () => {
      disposed = true;
      live()?.uTex.value?.dispose();
    };
  }, [src, invalidate, onReady, live]);

  useEffect(() => {
    const u = live();
    if (u) u.uAspect.value = size.width / Math.max(1, size.height);
    invalidate();
  }, [size, live, invalidate]);

  // Pointer → ripple trail + velocity
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const s = state.current;
    let lastPush = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) return;
      s.mouse.set(x, y);
      const now = performance.now();
      if (now - lastPush > 32) {
        lastPush = now;
        s.trail[s.head].set(x, y, 1);
        s.head = (s.head + 1) % TRAIL;
      }
    };
    addEventListener("pointermove", move, { passive: true });

    // Only render while something is moving and the canvas is on screen.
    const io = new IntersectionObserver(([en]) => (s.visible = en.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    const tick = () => {
      if (s.visible && (s.vel > 0.001 || s.trail.some((p) => p.z > 0.002))) invalidate();
    };
    gsap.ticker.add(tick);
    return () => {
      removeEventListener("pointermove", move);
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [target, invalidate]);

  useFrame((_, delta) => {
    const u = live();
    if (!u) return;
    const s = state.current;
    const dt = Math.min(delta, 1 / 30);
    u.uTime.value += dt;

    const dx = s.mouse.x - s.last.x;
    const dy = s.mouse.y - s.last.y;
    const speed = Math.hypot(dx, dy) / Math.max(dt, 1e-3);
    s.vel += (Math.min(speed * 0.3, 1) - s.vel) * 0.16;
    if (s.vel < 0.0015) s.vel = 0;
    if (speed > 0.0001) s.dir.set(dx, dy).normalize();
    s.last.copy(s.mouse);

    s.trail.forEach((p, i) => {
      p.z = p.z < 0.002 ? 0 : p.z * 0.95;
      u.uTrail.value[i].copy(p);
    });
    u.uDir.value.copy(s.dir);
    u.uVel.value = s.vel;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={initialUniforms}
        transparent
        premultipliedAlpha
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function PhotoCanvas(props: PhotoCanvasProps) {
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, matchMedia("(pointer: coarse)").matches ? 1.25 : 1.75);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" }}
      flat
      linear
      orthographic
      camera={{ position: [0, 0, 1] }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <PhotoPlane {...props} />
    </Canvas>
  );
}
