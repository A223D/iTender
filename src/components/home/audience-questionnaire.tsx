"use client";

import { useEffect, useRef, useState } from "react";

import { useAudienceSelection } from "@/components/home/use-audience-selection";
import { type Audience } from "@/lib/audience";

const options: Array<{
  value: Audience;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    value: "creator",
    title: "I'm a Creator",
    description: "Get paid to post what you love. Find local brand deals that match your vibe.",
    badge: "🎥",
  },
  {
    value: "business",
    title: "I'm a Business",
    description: "Find local creators who actually move the needle for your brand.",
    badge: "🏪",
  },
];

export function AudienceQuestionnaire() {
  const [pendingAudience, setPendingAudience] = useState<Audience | null>(null);
  const selectAudience = useAudienceSelection();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    import("animejs").then((mod) => {
      const { createTimeline, stagger } = mod;

      createTimeline()
        .add(
          el.querySelector(".q-heading")!,
          { opacity: [0, 1], translateY: [30, 0], duration: 700, delay: 150, ease: "easeOutExpo" },
        )
        .add(
          el.querySelectorAll(".q-card"),
          { opacity: [0, 1], translateY: [40, 0], scale: [0.95, 1], delay: stagger(100), duration: 650, ease: "easeOutExpo" },
          "-=350",
        );
    });
  }, []);

  function handleSelect(audience: Audience) {
    setPendingAudience(audience);
    selectAudience(audience);
  }

  return (
    <section className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div ref={containerRef} className="relative w-full max-w-3xl">
        <div className="q-heading mx-auto mb-6 max-w-2xl text-center opacity-0 sm:mb-10">
          <div className="mb-3 text-4xl sm:text-5xl">🚀</div>
          <h1 className="text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
            Built for Creators.{" "}
            <span className="text-[var(--color-accent-fg)]">
              Built for Businesses.
            </span>
          </h1>
          <p className="mt-3 text-base text-[var(--color-text-muted)] sm:mt-5 sm:text-lg">
            Start your journey with Scout — where creators and businesses grow together locally.
          </p>
        </div>

        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-hint)] sm:mb-6">
          I am a...
        </p>

        <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
          {options.map((option) => {
            const isPending = pendingAudience === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="group q-card glass relative p-5 text-left opacity-0 transition duration-300 hover:-translate-y-1 hover:opacity-90 sm:p-8"
                style={{ borderRadius: 24 }}
              >
                <div className="relative flex items-center gap-4 sm:block">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl glass text-3xl sm:h-16 sm:w-16 sm:rounded-2xl sm:text-4xl">
                    {option.badge}
                  </div>
                  <div className="sm:hidden">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">{option.title}</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">{option.description}</p>
                  </div>
                </div>

                <h2 className="relative mt-5 hidden text-2xl font-bold text-[var(--color-text)] sm:block">{option.title}</h2>
                <p className="relative mt-2 hidden text-[var(--color-text-muted)] sm:block">{option.description}</p>

                <div className="relative mt-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] sm:mt-5">
                  {isPending ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>Continue →</>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
