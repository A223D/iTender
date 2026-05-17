"use client";

import Link from "next/link";
import { type RefObject, useEffect, useRef, useState } from "react";

import { ParticleCanvas } from "@/components/effects/particle-canvas";
import { AnimatedDashboard, type SummaryPanel } from "@/components/home/animated-dashboard";

type HighlightCard = {
  title: string;
  items: string[];
};

type LandingStep = {
  icon?: string;
  title: string;
  description: string;
};

export type HomePageTemplateProps = {
  badge: string;
  title: string;
  description: string;
  highlightCards: HighlightCard[];
  primaryActionLabel: string;
  primaryActionHref?: string;
  secondaryActionLabel: string;
  secondaryActionHref?: string;
  summaryPanel: SummaryPanel;
  howItWorksDescription: string;
  howItWorksCards: LandingStep[];
  whyScoutDescription: string;
  whyScoutCards: LandingStep[];
  footerLinkLabel?: string;
  footerLinkHref?: string;
};

export function HomePageTemplate({
  badge,
  title,
  description,
  highlightCards,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  summaryPanel,
  howItWorksDescription,
  howItWorksCards,
  whyScoutDescription,
  whyScoutCards,
  footerLinkLabel,
  footerLinkHref,
}: HomePageTemplateProps) {
  const heroRef = useRef<HTMLElement>(null);
  const whyRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const [scrollVisible, setScrollVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrollVisible(window.scrollY < 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    import("animejs").then((mod) => {
      const { createTimeline, stagger } = mod;

      createTimeline()
        .add(
          el.querySelector(".hero-badge")!,
          { opacity: [0, 1], translateY: [18, 0], duration: 600, delay: 250, ease: "easeOutExpo" },
        )
        .add(
          el.querySelector(".hero-title")!,
          { opacity: [0, 1], translateY: [52, 0], duration: 950, ease: "easeOutExpo" },
          "-=200",
        )
        .add(
          el.querySelector(".hero-desc")!,
          { opacity: [0, 1], translateY: [22, 0], duration: 750, ease: "easeOutExpo" },
          "-=550",
        )
        .add(
          el.querySelectorAll(".hero-tag"),
          { opacity: [0, 1], translateY: [16, 0], delay: stagger(55), duration: 500, ease: "easeOutExpo" },
          "-=450",
        )
        .add(
          el.querySelectorAll(".hero-cta"),
          { opacity: [0, 1], translateY: [20, 0], scale: [0.93, 1], delay: stagger(80), duration: 550, ease: "easeOutExpo" },
          "-=350",
        )
        .add(
          el.querySelectorAll(".hero-emoji"),
          { opacity: [0, 1], scale: [0.5, 1], delay: stagger(60), duration: 600, ease: "easeOutExpo" },
          "-=600",
        );
    });
  }, []);

  useScrollSectionReveal(whyRef, ".why-heading", ".why-card");
  useScrollSectionReveal(howRef, ".how-heading", ".how-card");

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex min-h-screen items-start lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <ParticleCanvas />

        {/* Floating decorative emojis — desktop only */}
        <div className="pointer-events-none absolute inset-0 hidden select-none overflow-hidden lg:block">
          <span className="hero-emoji absolute left-[6%] top-[22%] text-4xl opacity-0 animate-float-slow">✨</span>
          <span className="hero-emoji absolute right-[10%] top-[18%] text-3xl opacity-0 animate-float-medium">🔥</span>
          <span className="hero-emoji absolute left-[3%] top-[55%] text-3xl opacity-0 animate-float-fast">💸</span>
          <span className="hero-emoji absolute right-[5%] bottom-[28%] text-3xl opacity-0 animate-float-slow">🌟</span>
          <span className="hero-emoji absolute left-[20%] bottom-[18%] text-2xl opacity-0 animate-float-medium">📱</span>
          <span className="hero-emoji absolute right-[22%] top-[12%] text-2xl opacity-0 animate-float-fast">🎯</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-0 lg:flex lg:h-full lg:items-center">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-10">

            {/* Left: text */}
            <div className="text-center lg:text-left">
              <div className="hero-badge mx-auto inline-flex items-center gap-2.5 rounded-full glass px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] opacity-0 lg:mx-0">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[var(--color-text-muted)]" />
                {badge}
              </div>

              <h1 className="hero-title mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-[var(--color-text)] opacity-0 sm:text-5xl xl:text-6xl">
                {title}
              </h1>

              <p className="hero-desc mt-5 text-base leading-relaxed text-[var(--color-text-muted)] opacity-0 sm:text-lg">
                {description}
              </p>

              <div className="mt-7 space-y-3">
                {highlightCards.map((card) => (
                  <div key={card.title} className="hero-tag flex items-start justify-center gap-3 opacity-0 lg:justify-start">
                    <span className="mt-0.5 w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-hint)]">
                      {card.title}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {card.items.map((item) => (
                        <span
                          key={item}
                          className="glass rounded-full px-3 py-1 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                {primaryActionHref ? (
                  <a
                    href={primaryActionHref}
                    className="hero-cta rounded-full bg-[var(--color-text)] px-7 py-3.5 text-sm font-bold text-slate-950 opacity-0 transition hover:opacity-80 active:scale-95 dark:text-slate-950"
                  >
                    {primaryActionLabel}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="hero-cta rounded-full bg-[var(--color-text)] px-7 py-3.5 text-sm font-bold text-slate-950 opacity-0 transition hover:opacity-80 active:scale-95 dark:text-slate-950"
                  >
                    {primaryActionLabel}
                  </button>
                )}
                {secondaryActionHref ? (
                  <a
                    href={secondaryActionHref}
                    className="hero-cta glass rounded-full px-7 py-3.5 text-sm font-semibold text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text)] active:scale-95"
                  >
                    {secondaryActionLabel}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="hero-cta glass rounded-full px-7 py-3.5 text-sm font-semibold text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text)] active:scale-95"
                  >
                    {secondaryActionLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Right: animated dashboard — desktop only */}
            <div className="hidden lg:flex lg:justify-end lg:pr-4">
              <AnimatedDashboard summaryPanel={summaryPanel} />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className={`pointer-events-none fixed bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 lg:flex ${scrollVisible ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-hint)]">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-[var(--color-text-hint)] to-transparent" />
        </div>
      </section>

      {/* ── WHY SCOUT ────────────────────────────────────── */}
      <section
        ref={whyRef as RefObject<HTMLElement>}
        id="why-scout"
        className="relative py-24 lg:py-32"
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="why-heading opacity-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent-fg)]">🙌 Why Scout</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold text-[var(--color-text)] lg:text-5xl">
              Built for how creators and brands{" "}
              <span className="text-[var(--color-accent-fg)]">
                actually work.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">
              {whyScoutDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {whyScoutCards.map((card, i) => (
              <div
                key={card.title}
                className="why-card glass group p-7 opacity-0 transition duration-300 hover:-translate-y-2"
                style={{ borderRadius: 24 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass text-2xl">
                  {card.icon ?? String(i + 1)}
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--color-text)]">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{card.description}</p>
              </div>
            ))}
          </div>

          {footerLinkLabel && footerLinkHref ? (
            <div className="mt-14">
              <Link
                href={footerLinkHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-text)] px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:opacity-80 dark:text-slate-950"
              >
                {footerLinkLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        ref={howRef as RefObject<HTMLElement>}
        id="how-it-works"
        className="relative overflow-hidden py-24 lg:py-32"
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="how-heading opacity-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent-fg)]">🗺️ How it Works</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold text-[var(--color-text)] lg:text-5xl">
              Three steps to your{" "}
              <span className="text-[var(--color-accent-fg)]">
                first deal.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">
              {howItWorksDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {howItWorksCards.map((card, i) => (
              <div
                key={card.title}
                className="how-card glass group p-8 opacity-0 transition duration-300 hover:-translate-y-2"
                style={{ borderRadius: 24 }}
              >
                <div className="flex items-center gap-3">
                  {card.icon ? (
                    <span className="text-3xl">{card.icon}</span>
                  ) : null}
                  <span className="select-none font-sans text-5xl font-bold leading-none text-[var(--color-text-hint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--color-text)]">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function useScrollSectionReveal(
  sectionRef: RefObject<HTMLElement | null>,
  headingSelector: string,
  cardSelector: string,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        import("animejs").then((mod) => {
          const { animate, stagger } = mod;
          animate(section.querySelector(headingSelector)!, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 750,
            ease: "easeOutExpo",
          });
          animate(section.querySelectorAll(cardSelector), {
            opacity: [0, 1],
            translateY: [42, 0],
            delay: stagger(100),
            duration: 750,
            ease: "easeOutExpo",
          });
        });
        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef, headingSelector, cardSelector]);
}
