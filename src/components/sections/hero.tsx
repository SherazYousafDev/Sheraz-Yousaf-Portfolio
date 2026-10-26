"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntro } from "@/lib/intro";
import { scramble } from "@/lib/scramble";
import { setChapter } from "@/lib/chapter";
import { scrollTo } from "@/lib/scroll-state";
import { chapters, person } from "@/data/portfolio";
import { KineticLine, useKineticName } from "@/components/hero/kinetic-name";
import { HeroPhoto } from "@/components/hero/hero-photo";
import { RoleTicker } from "@/components/hero/role-ticker";
import { OpenBadge } from "@/components/hero/open-badge";
import { LocalTime } from "@/components/ui/local-time";
import { StatusDot } from "@/components/ui/status-dot";

/** Offset of `el` inside `root`, from layout (ignores transforms). */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const kinetic = useRef(true);

  useKineticName(name, kinetic);

  useGSAP(
    () => {
      const root = section.current!;
      const h1 = name.current!;
      const q = gsap.utils.selector(root);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const disc = q("[data-disc]")[0] as HTMLElement;
      const oGlyph = h1.querySelector<HTMLElement>("[data-counter]")!;

      // ── Place the window disc inside the "O" counter.
      const placeDisc = () => {
        const { x, y } = offsetWithin(oGlyph, h1);
        const fs = parseFloat(getComputedStyle(h1).fontSize);
        // Tuned to Clash Display's "O": a touch larger than the counter so
        // the disc's edge always hides under the stroke.
        const w = fs * 0.51;
        const h = fs * 0.565;
        const cx = x + oGlyph.offsetWidth / 2 + fs * 0.012;
        const cy = y + oGlyph.offsetHeight / 2 - fs * 0.004;
        gsap.set(disc, { left: cx - w / 2, top: cy - h / 2, width: w, height: h });
        // Where the window sits on screen (the section is pinned at the top).
        const at = offsetWithin(h1, root);
        return { cx, cy, w, h, sx: at.x + cx, sy: at.y + cy };
      };
      placeDisc();

      // ── Start states (set before the preloader lifts).
      const chars = q("[data-intro-char]");
      const lives = q("[data-live]");
      const fades = q("[data-hero-fade]");
      const meta = q("[data-hero-meta] > *");
      const arch = q("[data-arch]");
      const portrait = q("[data-portrait]");
      const badge = q("[data-badge]");
      const cols = document.querySelectorAll("[data-grid-col]");
      const nav = document.querySelector("[data-intro='nav']");
      const rail = document.querySelector("[data-intro='rail']");

      if (!reduced) {
        gsap.set(chars, { yPercent: 112 });
        gsap.set(lives, { "--w": 500 });
        gsap.set(meta, { yPercent: 120 });
        gsap.set(fades, { y: 28, opacity: 0 });
        gsap.set(arch, { scaleY: 0, transformOrigin: "50% 100%" });
        gsap.set(portrait, { yPercent: 24, clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(badge, { scale: 0, rotate: -160 });
        gsap.set(cols, { scaleY: 0 });
        gsap.set(nav, { yPercent: -100 });
        gsap.set(rail, { opacity: 0, x: -16 });
        gsap.set(q("[data-cue-line]"), { scaleY: 0 });
      }

      // ── Depth: arch, portrait and badge drift at different rates with the mouse.
      let parallaxOn = false;
      const layers = q("[data-parallax]").map((el) => ({
        k: parseFloat((el as HTMLElement).dataset.parallax ?? "0"),
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "expo.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.1, ease: "expo.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        if (!parallaxOn) return;
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * l.k * 36);
          l.y(ny * l.k * 24);
        });
      };
      const resetParallax = () =>
        layers.forEach((l) => {
          l.x(0);
          l.y(0);
        });
      if (!reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
        addEventListener("pointermove", onMove, { passive: true });
      }

      // ── Page-load choreography:
      //    grid draws → letters roll in like a slot machine and land on the
      //    right glyph → a weight wave sweeps the name → the red arch rises and
      //    the portrait pops up out of it → badge springs in → copy + chrome.
      const off = onIntro(() => {
        if (reduced) return;
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(cols, { scaleY: 1, duration: 1.6, ease: "curtain", stagger: { each: 0.05, from: "center" } }, 0);

        chars.forEach((c, i) => {
          const live = c.querySelector<HTMLElement>("[data-live]");
          const glyph = live?.textContent ?? "";
          tl.to(
            c,
            {
              yPercent: 0,
              duration: 1.25,
              ease: "back.out(1.4)",
              onStart: () => {
                if (live) scramble(live, glyph, { duration: 620 + i * 25, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&" });
              },
            },
            0.12 + i * 0.065,
          );
        });

        tl.to(lives, { "--w": 700, duration: 0.38, ease: "power2.out", yoyo: true, repeat: 1, stagger: 0.04 }, 1.25)
          .to(arch, { scaleY: 1, duration: 1.4, ease: "expo.out" }, 0.4)
          .to(portrait, { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out" }, 0.62)
          .to(badge, { scale: 1, rotate: 0, duration: 1.4, ease: "elastic.out(1, 0.55)" }, 1.15)
          .to(meta, { yPercent: 0, duration: 1.1, stagger: 0.06 }, 0.35)
          .to(nav, { yPercent: 0, duration: 1.2 }, 0.5)
          .to(rail, { opacity: 1, x: 0, duration: 1.2 }, 0.6)
          .to(fades, { y: 0, opacity: 1, duration: 1.3, stagger: 0.08 }, 0.95)
          .to(q("[data-cue-line]"), { scaleY: 1, duration: 1, ease: "curtain" }, 1.4)
          .add(() => {
            // Let pushed glyphs breathe outside their reveal masks.
            gsap.set(q("[data-name-mask]"), { overflow: "visible" });
            gsap.set(portrait, { clearProps: "clipPath" });
            gsap.set(q("[data-cue-line]"), { clearProps: "transform" });
            q("[data-cue-line]")[0]?.classList.add("motion-safe:animate-[cue-line_2.4s_var(--ease-curtain)_infinite]");
            root.dataset.introDone = "1";
            parallaxOn = window.scrollY < 4;
          });
      });

      const offAll = () => {
        off();
        removeEventListener("pointermove", onMove);
      };

      if (reduced) return offAll;

      // ── Zoom-through: the "O" counter opens, then the name scales until
      //    the window fills the screen and becomes the next chapter.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 0px)", () => {
        let geo = placeDisc();
        // Scale until the ellipse covers the farthest viewport corner.
        const scaleFor = () => {
          const dx = Math.max(geo.sx, innerWidth - geo.sx);
          const dy = Math.max(geo.sy, innerHeight - geo.sy);
          return (Math.hypot(dx, dy) * 2.3) / Math.min(geo.w, geo.h);
        };

        gsap.set(disc, { scale: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${innerHeight * 1.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => (geo = placeDisc()),
            onUpdate: (self) => {
              kinetic.current = self.progress < 0.01;
              // Park the parallax while zooming so nothing drifts off the window.
              const atTop = self.progress <= 0.005;
              if (!atTop && parallaxOn) {
                parallaxOn = false;
                resetParallax();
              } else if (atTop && !parallaxOn && root.dataset.introDone) {
                parallaxOn = true;
              }
              setChapter(self.progress > 0.62 ? "ink" : "paper");
            },
          },
        });

        tl.to(disc, { scale: 1, duration: 0.14, ease: "power2.out" }, 0)
          .to(q("[data-hero-photo]"), { yPercent: 18, opacity: 0, duration: 0.22, ease: "power2.in" }, 0)
          .to(q("[data-hero-fade], [data-hero-meta]"), { y: -50, opacity: 0, duration: 0.16, stagger: 0.01, ease: "power2.in" }, 0)
          .to(
            h1,
            {
              scale: () => scaleFor(),
              transformOrigin: () => `${geo.cx}px ${geo.cy}px`,
              duration: 0.86,
              ease: "power3.in",
              force3D: false,
            },
            0.12,
          )
          .fromTo(q("[data-window-label]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.86);
      });

      return () => {
        offAll();
        mm.revert();
      };
    },
    { scope: section },
  );

  return (
    <section
      id="hero"
      ref={section}
      data-chapter="paper"
      aria-label="Introduction"
      className="relative h-svh min-h-[620px] overflow-hidden"
    >
      <div className="relative flex h-full flex-col px-gutter pb-5 pt-[84px] md:pt-[100px] lg:pl-[calc(var(--gutter)+var(--rail))]">
        {/* Meta row — editorial running head */}
        <div data-hero-meta className="label grid grid-cols-4 items-end gap-x-4 overflow-hidden border-b border-line pb-3 md:grid-cols-12">
          <span className="col-span-2 whitespace-nowrap md:col-span-1">SY-01 / {String(chapters.length).padStart(2, "0")}</span>
          <span className="hidden truncate md:col-span-4 md:col-start-3 md:block">(Index) — Portfolio, Ed. ’26</span>
          <span className="col-span-2 col-start-3 text-right md:col-span-3 md:col-start-7 md:text-left">Data / Interfaces</span>
          <span className="hidden text-right md:col-span-3 md:col-start-10 md:block">{person.coordinates}</span>
        </div>

        {/* The name */}
        <h1
          ref={name}
          aria-label={`${person.firstName} ${person.lastName}`}
          className="display relative z-30 mt-[3.5svh] w-fit select-none text-[min(20.5vw,15svh)] uppercase md:text-[min(17vw,22svh)] lg:text-[min(14vw,24svh)]"
        >
          <span data-disc aria-hidden className="absolute -z-10 block rounded-[50%] bg-[var(--c-ink-bg)]" />
          <span data-name-mask className="block overflow-hidden pb-[0.04em]">
            <KineticLine text={person.firstName} />
          </span>
          <span data-name-mask className="block overflow-hidden pb-[0.04em] pl-[0.3em] md:pl-[0.6em]">
            <KineticLine text={person.lastName} counterIndex={1} />
          </span>
        </h1>

        {/* Portrait — on mobile it fills the space left between name and copy;
            on desktop it breaks the grid on the right. */}
        <div className="relative -mt-2 mb-3 min-h-[120px] flex-1 lg:static lg:m-0 lg:min-h-0 lg:flex-none">
          <div
            data-hero-photo
            className="absolute inset-y-0 right-0 z-10 aspect-[422/591] [mask-image:linear-gradient(to_top,transparent,#000_14%)] lg:[mask-image:none] lg:inset-y-auto lg:bottom-0 lg:right-[var(--gutter)] lg:w-[min(31vw,56svh)]"
          >
            {/* The red arch the portrait rises out of */}
            <div data-parallax="0.7" className="absolute inset-x-[4%] bottom-0 h-[66%]">
              <div data-arch className="size-full rounded-t-full bg-accent" />
            </div>
            <div data-parallax="0.3" className="absolute inset-0">
              <div data-portrait className="size-full">
                <HeroPhoto />
              </div>
            </div>
            <div data-parallax="1.1" className="absolute left-[2%] top-[40%] z-20 lg:-left-[12%] lg:top-[38%] w-[30%] min-w-[64px] max-w-[150px]">
              <div data-badge>
                <OpenBadge className="w-full" />
              </div>
            </div>
            <p className="label absolute -left-2 top-[62%] hidden -translate-x-full text-right opacity-60 lg:block">
              Fig. 01 — S. Yousaf, Lahore
              <br />
              Move over the portrait ↘
            </p>
          </div>
        </div>

        {/* Lower deck */}
        <div className="relative z-20 grid lg:mt-auto grid-cols-4 gap-x-4 gap-y-5 md:grid-cols-12">
          <div data-hero-fade className="col-span-3 md:col-span-4">
            <p className="label mb-2 opacity-60">(Currently)</p>
            <p className="serif-i text-[clamp(30px,3.6vw,64px)] leading-[0.95]">
              <RoleTicker roles={person.roles} className="whitespace-nowrap" />
            </p>
          </div>
          <p data-hero-fade className="col-span-4 max-w-[34ch] text-[15px] leading-[1.45] md:col-span-4 md:text-[clamp(15px,1.15vw,20px)]">
            {person.tagline}
          </p>

          <div data-hero-fade className="label col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3 md:col-span-8">
            <span className="inline-flex items-center gap-2">
              <StatusDot /> {person.availabilityLabel}
            </span>
            <span>
              Lahore, PK — <LocalTime seconds /> PKT
            </span>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#about");
              }}
              className="group ml-auto inline-flex items-center gap-3"
              data-cursor="Scroll"
            >
              <span className="link-draw">Scroll to audit</span>
              <span className="relative block h-8 w-px overflow-hidden bg-line">
                <span data-cue-line className="absolute inset-0 block origin-top bg-current" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* What you see through the window at the end of the zoom */}
      <div
        data-window-label
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 text-[var(--c-ink-fg)] opacity-0"
      >
        <span className="label">SY-02 / {String(chapters.length).padStart(2, "0")} — About</span>
        <span className="serif-i text-center text-[clamp(36px,6vw,110px)] leading-[0.95]">
          the person behind
          <br />
          the spreadsheet
        </span>
      </div>
    </section>
  );
}

