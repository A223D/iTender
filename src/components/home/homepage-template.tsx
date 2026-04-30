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
  secondaryActionLabel: string;
  summaryPanel: SummaryPanel;
  howItWorksDescription: string;
  howItWorksCards: LandingStep[];
  whyScoutDescription: string;
  whyScoutCards: LandingStep[];
  footerLinkLabel?: string;
  footerLinkHref?: string;
};

const whyAccents = [
  { ring: "ring-coral/20", bg: "bg-coral/10", text: "text-coral" },
  { ring: "ring-violet/20", bg: "bg-violet/10", text: "text-violet" },
  { ring: "ring-teal/20", bg: "bg-teal/10", text: "text-teal" },
];

const howAccents = [
  { num: "from-coral to-violet" },
  { num: "from-violet to-teal" },
  { num: "from-teal to-gold" },
];

export function HomePageTemplate({
  badge,
  title,
  description,
  highlightCards,
  primaryActionLabel,
  secondaryActionLabel,
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
    <div className="overflow-hidden bg-white text-gray-900">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex min-h-screen items-start lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <ParticleCanvas />

        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/4 h-[700px] w-[700px] rounded-full bg-violet/[0.08] blur-[140px]" />
          <div className="absolute right-0 top-1/3 h-[560px] w-[560px] rounded-full bg-coral/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-teal/[0.05] blur-[120px]" />
        </div>

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
              <div className="hero-badge mx-auto inline-flex items-center gap-2.5 rounded-full border border-coral/25 bg-coral/[0.07] px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-coral opacity-0 lg:mx-0">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-coral" />
                {badge}
              </div>

              <h1 className="hero-title mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 opacity-0 sm:text-5xl xl:text-6xl">
                {title}
              </h1>

              <p className="hero-desc mt-5 text-base leading-relaxed text-gray-500 opacity-0 sm:text-lg">
                {description}
              </p>

              <div className="mt-7 space-y-3">
                {highlightCards.map((card) => (
                  <div key={card.title} className="hero-tag flex items-start justify-center gap-3 opacity-0 lg:justify-start">
                    <span className="mt-0.5 w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {card.title}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {card.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition hover:border-violet/30 hover:bg-violet/[0.04]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <button
                  type="button"
                  className="hero-cta rounded-full bg-gradient-to-r from-coral to-violet px-7 py-3.5 text-sm font-bold text-white opacity-0 shadow-glow transition hover:opacity-90 active:scale-95"
                >
                  {primaryActionLabel}
                </button>
                <button
                  type="button"
                  className="hero-cta rounded-full border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 opacity-0 transition hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                >
                  {secondaryActionLabel}
                </button>
              </div>
            </div>

            {/* Right: animated dashboard — desktop only */}
            <div className="hidden lg:flex lg:justify-end lg:pr-4">
              <AnimatedDashboard summaryPanel={summaryPanel} />
            </div>
          </div>
        </div>

        {/* Scroll hint — fixed to viewport bottom, desktop only, fades on scroll */}
        <div
          className={`pointer-events-none fixed bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 lg:flex ${scrollVisible ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-gray-300 to-transparent" />
        </div>
      </section>

      {/* ── WHY SCOUT ────────────────────────────────────── */}
      <section
        ref={whyRef as RefObject<HTMLElement>}
        id="why-scout"
        className="relative bg-[#F7F6FF] py-24 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-violet/[0.08] blur-[110px]" />
          <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-coral/[0.06] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="why-heading opacity-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet">🙌 Why Scout</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold text-gray-900 lg:text-5xl">
              Built for how creators and brands{" "}
              <span className="bg-gradient-to-r from-coral via-violet to-teal bg-clip-text text-transparent">
                actually work.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
              {whyScoutDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {whyScoutCards.map((card, i) => {
              const accent = whyAccents[i % whyAccents.length];
              return (
                <div
                  key={card.title}
                  className="why-card group relative rounded-3xl border border-gray-200 bg-white p-7 opacity-0 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gray-300 hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-2 ${accent.ring} ${accent.bg} text-2xl`}
                  >
                    {card.icon ?? String(i + 1)}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-500">{card.description}</p>
                </div>
              );
            })}
          </div>

          {footerLinkLabel && footerLinkHref ? (
            <div className="mt-14">
              <Link
                href={footerLinkHref}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-coral to-violet px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
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
        className="relative overflow-hidden bg-white py-24 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[450px] w-[450px] rounded-full bg-coral/[0.06] blur-[110px]" />
          <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-teal/[0.05] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="how-heading opacity-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-coral">🗺️ How it Works</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold text-gray-900 lg:text-5xl">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-violet to-teal bg-clip-text text-transparent">
                first deal.
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
              {howItWorksDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {howItWorksCards.map((card, i) => {
              const accent = howAccents[i % howAccents.length];
              return (
                <div
                  key={card.title}
                  className="how-card group relative rounded-3xl border border-gray-200 bg-white p-8 opacity-0 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {card.icon ? (
                      <span className="text-3xl">{card.icon}</span>
                    ) : null}
                    <span className={`select-none bg-gradient-to-br ${accent.num} bg-clip-text font-display text-5xl font-bold leading-none text-transparent`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-500">{card.description}</p>
                </div>
              );
            })}
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
