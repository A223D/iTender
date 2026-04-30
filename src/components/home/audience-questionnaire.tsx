"use client";

import { useEffect, useRef, useState } from "react";

import { useAudienceSelection } from "@/components/home/use-audience-selection";
import { type Audience } from "@/lib/audience";

const options: Array<{
  value: Audience;
  title: string;
  description: string;
  badge: string;
  accent: string;
  ring: string;
  chipBg: string;
  chipText: string;
}> = [
  {
    value: "creator",
    title: "I'm a Creator",
    description: "Get paid to post what you love. Find local brand deals that match your vibe.",
    badge: "🎥",
    accent: "from-coral to-violet",
    ring: "hover:ring-2 hover:ring-coral/30 focus-visible:ring-2 focus-visible:ring-coral/30",
    chipBg: "bg-coral/[0.07] border-coral/20",
    chipText: "text-coral",
  },
  {
    value: "business",
    title: "I'm a Business",
    description: "Find local creators who actually move the needle for your brand.",
    badge: "🏪",
    accent: "from-violet to-teal",
    ring: "hover:ring-2 hover:ring-violet/30 focus-visible:ring-2 focus-visible:ring-violet/30",
    chipBg: "bg-violet/[0.07] border-violet/20",
    chipText: "text-violet",
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
    <section className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-violet/[0.07] blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-coral/[0.06] blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-teal/[0.05] blur-[90px]" />
      </div>

      <div ref={containerRef} className="relative w-full max-w-3xl">
        <div className="q-heading mx-auto mb-6 max-w-2xl text-center opacity-0 sm:mb-10">
          <div className="mb-3 text-4xl sm:text-5xl">🚀</div>
          <h1 className="font-display text-3xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
            Built for Creators.{" "}
            <span className="bg-gradient-to-r from-coral via-violet to-teal bg-clip-text text-transparent">
              Built for Businesses.
            </span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg">
            Start your journey with Scout — where creators and businesses grow together locally.
          </p>
        </div>

        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400 sm:mb-6">
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
                className={`group q-card relative rounded-2xl border border-gray-200 bg-white p-5 text-left opacity-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-3xl sm:p-8 ${option.ring}`}
              >
                {/* Gradient glow on hover */}
                <div
                  className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br sm:rounded-3xl ${option.accent} opacity-0 blur-xl transition duration-500 group-hover:opacity-[0.06]`}
                />

                <div className="relative flex items-center gap-4 sm:block">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-16 sm:w-16 sm:rounded-2xl ${option.accent} text-3xl shadow-md sm:text-4xl`}
                  >
                    {option.badge}
                  </div>
                  <div className="sm:hidden">
                    <h2 className="text-lg font-bold text-gray-900">{option.title}</h2>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>

                <h2 className="relative mt-5 hidden text-2xl font-bold text-gray-900 sm:block">{option.title}</h2>
                <p className="relative mt-2 hidden text-gray-500 sm:block">{option.description}</p>

                <div className={`relative mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold sm:mt-5 ${option.chipBg} ${option.chipText}`}>
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
