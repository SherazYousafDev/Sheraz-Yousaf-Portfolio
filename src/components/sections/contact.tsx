"use client";

import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { chapters, person, socials } from "@/data/portfolio";
import { Magnetic } from "@/components/ui/magnetic";
import { WipeButton } from "@/components/ui/wipe-button";
import { LocalTime } from "@/components/ui/local-time";
import { StatusDot } from "@/components/ui/status-dot";
import { ScrambleText } from "@/components/ui/scramble-text";

const pad = (n: number) => String(n).padStart(2, "0");

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for http / older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function Contact() {
  const section = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef(0);

  const onCopy = async () => {
    const ok = await copyText(person.email);
    if (!ok) return;
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(section);

      // The giant CTA: letters rise out of their own masks, staggered from the centre.
      SplitText.create(q("[data-cta-line]"), {
        type: "chars",
        mask: "chars",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 115,
            duration: 1.4,
            ease: "expo.out",
            stagger: { each: 0.035, from: "center" },
            scrollTrigger: { trigger: q("[data-cta]")[0], start: "top 80%", once: true },
          }),
      });

      gsap.from(q("[data-contact-row]"), {
        y: 30,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: q("[data-contact-grid]")[0], start: "top 88%", once: true },
      });
    },
    { scope: section },
  );

  return (
    <section
      id="contact"
      ref={section}
      data-chapter="ink"
      aria-labelledby="contact-title"
      className="relative flex min-h-svh flex-col px-gutter pb-16 pt-[16vh] lg:pl-[calc(var(--gutter)+var(--rail))]"
    >
      <div className="label grid grid-cols-4 gap-x-4 border-b border-line pb-3 md:grid-cols-12">
        <span className="col-span-2 whitespace-nowrap">SY-07 / {pad(chapters.length)}</span>
        <span className="hidden md:col-span-3 md:col-start-3 md:block">(Contact) — open the ticket</span>
        <span className="col-span-2 col-start-3 inline-flex items-center justify-end gap-2 md:col-span-3 md:col-start-10">
          <StatusDot /> {person.availabilityLabel}
        </span>
      </div>

      {/* ── The CTA */}
      <div data-cta className="flex flex-1 flex-col justify-center py-[8vh]">
        <p className="label mb-6 opacity-60">(Hiring a data analyst — or need a site built?)</p>
        <Magnetic strength={0.12} className="w-fit">
          <a href={`mailto:${person.email}`} className="group/cta block w-fit" aria-label={`Let's talk — email ${person.email}`}>
            <h2 id="contact-title" aria-hidden className="display text-[22vw] uppercase leading-[0.82] md:text-[min(15vw,30svh)]">
              <span data-cta-line className="block">
                Let’s
              </span>
              <span data-cta-line className="serif-i block pl-[0.5em] normal-case text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover/cta:translate-x-[0.12em]">
                talk
                <span aria-hidden className="ml-[0.08em] inline-block text-[0.4em] align-top transition-transform duration-700 ease-[var(--ease-expo)] group-hover/cta:-translate-y-[0.15em] group-hover/cta:translate-x-[0.15em]">
                  ↗
                </span>
              </span>
            </h2>
          </a>
        </Magnetic>
      </div>

      {/* ── Details */}
      <div data-contact-grid className="grid grid-cols-4 gap-x-4 gap-y-8 border-t border-line pt-8 md:grid-cols-12">
        <div data-contact-row className="col-span-4 md:col-span-5">
          <p className="label mb-3 opacity-60">Email</p>
          <button
            type="button"
            onClick={onCopy}
            className="group/e flex w-fit items-baseline gap-4 text-left"
            aria-label={`Copy email address ${person.email}`}
          >
            <span className="link-draw text-[clamp(20px,2.2vw,38px)] leading-tight">{person.email}</span>
            <span className={`label shrink-0 transition-opacity group-hover/e:opacity-100 ${copied ? "text-accent" : "opacity-60"}`}>
              {copied ? "Copied ✓" : "Copy"}
            </span>
          </button>
          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
          <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="link-draw mt-4 inline-block text-[16px] opacity-80">
            {person.phone}
          </a>
        </div>

        <div data-contact-row className="col-span-2 md:col-span-3 md:col-start-7">
          <p className="label mb-3 opacity-60">Elsewhere</p>
          <ul className="flex flex-col gap-2">
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer" className="link-draw text-[16px] md:text-[18px]">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div data-contact-row className="col-span-2 flex flex-col items-start md:col-span-3 md:col-start-10">
          <p className="label mb-3 opacity-60">Résumé</p>
          <Magnetic strength={0.3}>
            <WipeButton href={person.resume} download="Sheraz-Yousaf-Resume.pdf" className="label px-5 py-3.5">
              <ScrambleText>Download PDF</ScrambleText> ↓
            </WipeButton>
          </Magnetic>
          <p className="label mt-5 opacity-60">
            Lahore — <LocalTime /> PKT
          </p>
        </div>
      </div>
    </section>
  );
}
