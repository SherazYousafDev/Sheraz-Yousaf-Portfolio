"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { chapters, githubProfile, playground, type Experiment } from "@/data/portfolio";
import { ScrambleText } from "@/components/ui/scramble-text";

const pad = (n: number) => String(n).padStart(2, "0");

type Card = (Experiment & { kind: "experiment" }) | { kind: "more" };
const cards: Card[] = [...playground.map((p) => ({ ...p, kind: "experiment" as const })), { kind: "more" }];
/** Split into 3 columns, row by row, so desktop reads left → right. */
const columns = [0, 1, 2].map((c) => cards.filter((_, i) => i % 3 === c));

function CardBody({ card, index }: { card: Card; index: number }) {
  if (card.kind === "more") {
    return (
      <div className="flex aspect-[4/5] flex-col justify-between bg-[var(--fg)] p-6 text-[var(--bg)] md:p-8">
        <span className="label">RAW_FILE_V{pad(index + 1)} · Open source</span>
        <span className="display text-[clamp(40px,4.2vw,72px)] leading-[0.9]">
          Explore every <span className="serif-i text-accent">experiment</span>
        </span>
        <span className="label flex items-center justify-between">
          <ScrambleText>github.com/SherazYousafDev</ScrambleText>
          <span aria-hidden className="text-[20px]">↗</span>
        </span>
      </div>
    );
  }
  return (
    <>
      <div className="relative aspect-[16/11] overflow-hidden border-b border-line bg-[color-mix(in_oklab,var(--fg)_8%,var(--bg))]">
        {card.image ? (
          <Image
            src={card.image}
            alt={`${card.name} — screenshot`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-1000 ease-[var(--ease-expo)] group-hover/card:scale-[1.06]"
          />
        ) : (
          // Alternate poster colours so neighbouring "coming soon" cards never look identical.
          <div className={`absolute inset-0 flex items-end p-5 ${index % 2 ? "bg-accent text-[#141312]" : "bg-[var(--fg)] text-[var(--bg)]"}`}>
            <span className="display text-[clamp(36px,3.6vw,60px)] leading-[0.85]">{card.name}</span>
            <span className="label absolute right-5 top-5">WIP</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <div className="label flex justify-between opacity-60">
          <span>{card.file}</span>
          <span>{card.href ? "Live ↗" : "Soon"}</span>
        </div>
        <h3 className="display text-[clamp(28px,2.4vw,40px)] leading-none">{card.name}</h3>
        <p className="text-[14px] leading-relaxed opacity-75 md:text-[15px]">{card.blurb}</p>
        <ul className="mt-1 flex flex-wrap gap-2" aria-label="Built with">
          {card.stack.map((t) => (
            <li key={t} className="label rounded-full border border-line px-3 py-1 normal-case tracking-normal">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Playground() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      const cleanups: (() => void)[] = [];

      // ── Hover tilt: the card leans toward the cursor (siblings blur via CSS).
      if (fine && !reduced) {
        (q("[data-tilt]") as HTMLElement[]).forEach((el) => {
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
          gsap.set(el, { transformPerspective: 900 });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 10);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }

      if (reduced) return () => cleanups.forEach((c) => c());

      // ── Title letters drop in, one by one.
      gsap.from(q("[data-pg-char]"), {
        yPercent: -110,
        rotate: (i: number) => (i % 2 ? 8 : -8),
        duration: 1.2,
        ease: "back.out(1.7)",
        stagger: 0.04,
        scrollTrigger: { trigger: q("[data-pg-title]")[0], start: "top 85%", once: true },
      });

      // ── Cards rise in with a slight spin, in reading order.
      (q("[data-pg-card]") as HTMLElement[]).forEach((card) => {
        gsap.from(card, {
          y: 120,
          rotate: Number(card.dataset.spin ?? 0),
          scale: 0.9,
          opacity: 0,
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 92%", once: true },
        });
      });

      // ── Desktop: the three columns drift at different speeds (parallax).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        (q("[data-pg-col]") as HTMLElement[]).forEach((col, i) => {
          gsap.fromTo(
            col,
            { y: [60, 160, 20][i] },
            { y: [-60, -120, -20][i], ease: "none", scrollTrigger: { trigger: q("[data-pg-grid]")[0], start: "top bottom", end: "bottom top", scrub: 0.6 } },
          );
        });
      });

      return () => {
        cleanups.forEach((c) => c());
        mm.revert();
      };
    },
    { scope: section },
  );

  const title = "Playground";

  return (
    <section
      id="playground"
      ref={section}
      data-chapter="paper"
      aria-labelledby="playground-title"
      className="relative px-gutter pb-[18vh] pt-[18vh] lg:pl-[calc(var(--gutter)+var(--rail))]"
    >
      <div className="label grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:grid-cols-12">
        <span className="col-span-2 whitespace-nowrap">SY-05 / {pad(chapters.length)}</span>
        <span className="hidden md:col-span-3 md:col-start-3 md:block">(Playground) — side experiments</span>
        <span className="col-span-2 col-start-3 text-right md:col-span-3 md:col-start-10">{playground.length} raw files</span>
      </div>

      <div className="grid grid-cols-4 items-end gap-x-4 pt-[5vh] md:grid-cols-12">
        <h2 id="playground-title" data-pg-title data-velocity className="display col-span-4 md:col-span-8">
          <span className="block text-[8vw] uppercase leading-none md:text-[min(3.2vw,6svh)]">My</span>
          <span aria-label={title} className="serif-i flex overflow-hidden pb-[0.08em] text-[22vw] leading-[0.9] text-accent md:text-[min(13vw,26svh)]">
            {title.split("").map((ch, i) => (
              <span key={i} aria-hidden data-pg-char className="inline-block">
                {ch}
              </span>
            ))}
          </span>
        </h2>
        <p className="col-span-4 mt-6 max-w-[34ch] text-[15px] leading-relaxed opacity-70 md:col-span-4 md:mt-0 md:pb-[2vw]">
          Things I build to learn — music players, editors, a macOS-style portfolio. Hover one; the rest step back.
        </p>
      </div>

      {/* The wall. Hovering/focusing a card blurs and dims its siblings (CSS :has, in globals). */}
      <div data-pg-grid className="pg-wall mt-[10vh] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[2vw]">
        {columns.map((col, c) => (
          <ul key={c} data-pg-col className={`contents lg:flex lg:flex-col lg:gap-[2vw] ${c === 1 ? "lg:pt-[14vh]" : ""}`}>
            {col.map((card) => {
              const index = cards.indexOf(card);
              const href = card.kind === "more" ? githubProfile : card.href;
              const inner = (
                <div data-tilt className="group/card relative overflow-hidden border border-line bg-[var(--bg)] will-change-transform">
                  <CardBody card={card} index={index} />
                </div>
              );
              return (
                <li
                  key={index}
                  data-pg-card
                  data-spin={[-4, 3, -2, 4, -3, 2][index % 6]}
                  className="pg-card"
                  // below lg the column <ul>s are display:contents, so order keeps V01 → V06 reading order
                  style={{ order: index }}
                >
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      aria-label={card.kind === "more" ? "Explore all experiments on GitHub" : `Open ${card.name} in a new tab`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div tabIndex={0} className="block outline-none focus-visible:outline-2">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </section>
  );
}
