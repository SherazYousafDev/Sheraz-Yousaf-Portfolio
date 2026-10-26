"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { scrollState, scrollTo } from "@/lib/scroll-state";
import { chapters, nav, person, socials } from "@/data/portfolio";
import { ScrambleText } from "@/components/ui/scramble-text";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocalTime } from "@/components/ui/local-time";
import { StatusDot } from "@/components/ui/status-dot";

const pad = (n: number) => String(n).padStart(2, "0");
/** Nav numbers match the section's chapter number (SY-0X), even when chapters are skipped. */
const numberOf = (href: string) => pad(chapters.findIndex((c) => `#${c.id}` === href) + 1);
const curtain = [0.76, 0, 0.24, 1] as const;

export function Navbar() {
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let hidden = false;
    let lastY = 0;
    const tick = () => {
      const y = scrollState.lenis ? scrollState.scroll : scrollY;
      const dy = y - lastY;
      lastY = y;
      const shouldHide = y > 140 && dy > 0.5;
      const shouldShow = dy < -0.5 || y <= 140;
      if (shouldHide && !hidden) {
        hidden = true;
        gsap.to(el, { yPercent: -110, duration: 0.7, ease: "curtain", overwrite: true });
      } else if (shouldShow && hidden) {
        hidden = false;
        gsap.to(el, { yPercent: 0, duration: 0.7, ease: "expo.out", overwrite: true });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Lock scroll + Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const btn = menuBtn.current;
    scrollState.lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      scrollState.lenis?.start();
      removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // Let the menu curtain start closing before the page moves.
    setTimeout(() => scrollTo(href), open ? 350 : 0);
  };

  return (
    <>
      <header
        ref={bar}
        data-intro="nav"
        data-menu-open={open ? "" : undefined}
        className="ui fixed inset-x-0 top-0 z-[80] px-gutter lg:pl-[calc(var(--gutter)+var(--rail))]"
      >
        <div className="flex h-16 items-center justify-between gap-6 border-b border-line md:h-[72px]">
          <a href="#hero" onClick={go("#hero")} className="group flex items-center gap-3" aria-label="Sheraz Yousaf, back to top">
            <span className="display text-[22px] leading-none tracking-[-0.04em]">SY</span>
            <span className="label hidden sm:inline">
              <ScrambleText>{`${person.firstName} ${person.lastName}`}</ScrambleText>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={go(item.href)} className="label link-draw flex gap-1.5 py-2">
                    <span className="opacity-50">{numberOf(item.href)}</span>
                    <ScrambleText>{item.label}</ScrambleText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <span className="label hidden items-center gap-2 xl:inline-flex">
              <StatusDot /> Available
            </span>
            <span className="label hidden md:inline">
              LHR <LocalTime />
            </span>
            <ThemeToggle />
            <button
              ref={menuBtn}
              type="button"
              className="label relative z-[85] flex h-9 items-center gap-2 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-2.5 w-6" aria-hidden>
                <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-curtain)] ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-curtain)] ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
              </span>
              <span>{open ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-chapter-lock="ink"
            className="fixed inset-0 z-[79] flex flex-col bg-[var(--c-ink-bg)] px-gutter pb-8 pt-24 lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.9, ease: curtain } }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.7, ease: curtain, delay: 0.15 } }}
          >
            <p className="label mb-6 opacity-60">SY 00 / Index</p>
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={item.href}
                    onClick={go(item.href)}
                    className="flex items-baseline justify-between py-2"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%", transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 + i * 0.06 } }}
                    exit={{ y: "-110%", transition: { duration: 0.5, ease: curtain, delay: i * 0.03 } }}
                  >
                    <span className="display text-[13vw] leading-[0.95] sm:text-[10vw]">
                      {item.label === "Contact" ? <span className="serif-i">{item.label}</span> : item.label}
                    </span>
                    <span className="label opacity-60">{numberOf(item.href)}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="label mt-8 grid grid-cols-2 gap-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.7, duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <a href={`mailto:${person.email}`} className="col-span-2 normal-case link-draw w-fit">
                {person.email}
              </a>
              {socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="link-draw w-fit">
                  {s.label} ↗
                </a>
              ))}
              <span className="col-span-2 flex items-center gap-2 opacity-70">
                <StatusDot /> Lahore · <LocalTime />
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
