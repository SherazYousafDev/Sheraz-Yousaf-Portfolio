"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { about, chapters, person } from "@/data/portfolio";
import { RevealText } from "@/components/ui/reveal-text";
import { LocalTime } from "@/components/ui/local-time";

type Unit = { text: string; kind: "plain" | "serif" | "term"; tail: string; space: boolean };

/** "*x*" → serif accent, "[x y]" → data term; punctuation sticks to the word before it. */
function parseManifesto(src: string): Unit[] {
  const units: Unit[] = [];
  let space = false;
  for (const part of src.split(/(\*[^*]+\*|\[[^\]]+\])/)) {
    if (!part) continue;
    if (part.startsWith("*") || part.startsWith("[")) {
      units.push({ text: part.slice(1, -1), kind: part[0] === "*" ? "serif" : "term", tail: "", space });
      space = false;
      continue;
    }
    // Leading punctuation (e.g. "." after "*agrees*") belongs to the previous unit.
    const lead = part.match(/^[^\s]+/);
    let rest = part;
    if (lead && units.length && !space) {
      units[units.length - 1].tail += lead[0];
      rest = part.slice(lead[0].length);
    }
    const words = rest.split(/\s+/);
    words.forEach((w, i) => {
      if (w) {
        units.push({ text: w, kind: "plain", tail: "", space: units.length > 0 && (i > 0 || /^\s/.test(rest)) });
      }
    });
    space = /\s$/.test(rest);
  }
  return units;
}

const units = parseManifesto(about.manifesto);
const pad = (n: number, l = 2) => String(n).padStart(l, "0");

export function About() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section);
      // Markup is fully "lit" so no-JS / reduced-motion visitors read it as is;
      // the hidden start states only exist once we know we'll animate them.
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(q("[data-word]"), { opacity: 0.14 });
      gsap.set(q("[data-rule-term], [data-rule]"), { scaleX: 0 });

      // ── Manifesto: pinned while every word is "audited" into the light.
      const words = q("[data-word]");
      const progressEl = q("[data-audit-progress]")[0] as HTMLElement | undefined;
      const STEP = 0.12;
      const tl = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: q("[data-manifesto]")[0],
          start: "top top",
          end: () => `+=${innerHeight * 1.5}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressEl) progressEl.textContent = pad(Math.round(self.progress * 100), 3);
          },
        },
      });
      words.forEach((w, i) => {
        tl.to(w, { opacity: 1, duration: 0.3 }, i * STEP);
        const rule = w.querySelector("[data-rule-term]");
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.45, ease: "power3.out" }, i * STEP + 0.15);
      });
      tl.fromTo(
        q("[data-stamp]"),
        { opacity: 0, scale: 2.4, rotate: -24 },
        { opacity: 1, scale: 1, rotate: -9, duration: 0.6, ease: "back.out(2.2)" },
        words.length * STEP + 0.1,
      ).to({}, { duration: 0.8 });

      // ── Spec sheet: rules draw left → right, then each value wipes in like a highlighter.
      gsap.timeline({ scrollTrigger: { trigger: q("[data-facts]")[0], start: "top 80%", once: true } })
        .to(q("[data-rule]"), { scaleX: 1, duration: 1.2, ease: "curtain", stagger: 0.08 })
        .fromTo(
          q("[data-fact]"),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.08 },
          0.25,
        );

      // ── Method numbers flip up into place.
      q("[data-step]").forEach((el) => {
        gsap.from(el.querySelectorAll("[data-step-in]"), {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

    },
    { scope: section },
  );

  return (
    <section
      id="about"
      ref={section}
      data-chapter="ink"
      data-chapter-start="top bottom"
      aria-labelledby="about-title"
      className="relative px-gutter pb-[16vh] lg:pl-[calc(var(--gutter)+var(--rail))]"
    >
      {/* ── 01 · Manifesto (pinned) */}
      <div data-manifesto className="relative flex min-h-svh flex-col justify-center py-24">
        <div className="label absolute inset-x-0 top-[88px] grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:top-[100px] md:grid-cols-12">
          <span className="col-span-2 whitespace-nowrap md:col-span-2">
            SY-02 / {pad(chapters.length)}
          </span>
          <h2 id="about-title" className="hidden md:col-span-3 md:col-start-3 md:block">
            (About) — Manifesto
          </h2>
          <span className="col-span-2 col-start-3 text-right md:col-span-3 md:col-start-10">
            Audit progress <span data-audit-progress className="tabular">000</span>%
          </span>
        </div>

        <p className="display relative max-w-[22ch] text-[6.4vw] leading-[1.04] tracking-[-0.025em] md:max-w-[24ch] md:text-[min(4.3vw,6.4svh)]">
          <span className="sr-only">{about.manifesto.replace(/[*[\]]/g, "")}</span>
          <span aria-hidden>
            {units.map((u, i) => (
              <Fragment key={i}>
                {u.space && " "}
                <span data-word className="inline-block">
                  {u.kind === "serif" ? (
                    <span className="serif-i pr-[0.04em] text-[1.08em] text-accent">{u.text}</span>
                  ) : u.kind === "term" ? (
                    <span className="relative inline-block">
                      {u.text}
                      <span data-rule-term className="absolute inset-x-0 bottom-[0.02em] h-[0.07em] origin-left bg-accent" />
                    </span>
                  ) : (
                    u.text
                  )}
                  {u.tail}
                </span>
              </Fragment>
            ))}
          </span>
          {/* the auditor's stamp */}
          <span
            data-stamp
            aria-hidden
            className="label absolute -bottom-[12%] right-0 inline-flex flex-col items-center rounded-[6px] border-2 border-accent px-4 py-2 text-[12px] text-accent md:-right-[14%] md:bottom-[2%] md:text-[13px]"
          >
            <span className="tracking-[0.2em]">Verified ✓</span>
            <span className="opacity-80">Audited by {person.initials}</span>
          </span>
        </p>
      </div>

      {/* ── 02 · Spec sheet + Method */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-20 pt-[10vh] md:grid-cols-12">
        <div className="col-span-4 md:col-span-5">
          <p className="label mb-6 opacity-60">(Spec sheet)</p>
          <dl data-facts>
            {about.facts.map((f) => (
              <div key={f.k} className="relative grid grid-cols-[96px_1fr] items-baseline gap-4 py-4 md:grid-cols-[120px_1fr]">
                <dt className="label opacity-60">{f.k}</dt>
                <dd data-fact className="text-[16px] leading-snug md:text-[clamp(16px,1.2vw,21px)]">
                  {f.v}
                  {f.live && (
                    <span className="label ml-3 align-middle opacity-60">
                      <LocalTime /> PKT
                    </span>
                  )}
                </dd>
                <span data-rule aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-line" />
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-7">
          <p className="label mb-6 opacity-60">(Method — how a catalog gets clean)</p>
          <ol>
            {about.method.map((m, i) => (
              <li key={m.t} data-step className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-line py-6 last:border-b">
                <span className="overflow-hidden">
                  <span data-step-in className="label block pt-2 text-accent">
                    {pad(i + 1)}
                  </span>
                </span>
                <div>
                  <h3 className="overflow-hidden">
                    <span data-step-in className="display block text-[clamp(28px,3vw,52px)] leading-[0.95]">
                      {m.t}
                    </span>
                  </h3>
                  <RevealText className="mt-3 max-w-[46ch] text-[15px] leading-relaxed opacity-75 md:text-[16px]" start="top 88%">
                    {m.d}
                  </RevealText>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
