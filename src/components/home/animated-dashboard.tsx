"use client";

import { useEffect, useRef } from "react";

type LandingStat = {
  label: string;
  value: string;
  tone?: "rose" | "emerald" | "slate";
};

type SummaryCard = {
  title: string;
  subtitle: string;
  detail: string;
  actionLabel: string;
};

export type SummaryPanel = {
  label: string;
  title: string;
  subtitle: string;
  stats: LandingStat[];
  footerCard: SummaryCard;
};

type Props = {
  summaryPanel: SummaryPanel;
};

const toneBg: Record<NonNullable<LandingStat["tone"]>, string> = {
  rose: "bg-coral/[0.08] border-coral/20",
  emerald: "bg-teal/[0.08] border-teal/20",
  slate: "bg-gray-50 border-gray-200",
};

const toneValue: Record<NonNullable<LandingStat["tone"]>, string> = {
  rose: "text-coral",
  emerald: "text-teal",
  slate: "text-gray-800",
};

export function AnimatedDashboard({ summaryPanel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      import("animejs").then((mod) => {
        const { createTimeline, stagger } = mod;

        createTimeline()
          .add(
            container.querySelector(".dashboard-frame")!,
            { opacity: [0, 1], translateY: [60, 0], scale: [0.9, 1], duration: 1100, delay: 500, ease: "easeOutExpo" },
          )
          .add(
            container.querySelectorAll(".dashboard-stat"),
            { opacity: [0, 1], translateY: [16, 0], delay: stagger(70), duration: 500, ease: "easeOutExpo" },
            "-=450",
          )
          .add(
            container.querySelector(".dashboard-footer")!,
            { opacity: [0, 1], translateY: [24, 0], duration: 600, ease: "easeOutExpo" },
            "-=200",
          )
          .add(
            container.querySelectorAll(".float-chip"),
            { opacity: [0, 1], scale: [0.75, 1], delay: stagger(120), duration: 450, ease: "easeOutExpo" },
            "-=400",
          );
      });
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[340px]">
      {/* Floating chips */}
      <div
        className="float-chip absolute -left-8 -top-8 z-20 opacity-0 animate-float-slow rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-md"
        style={{ animationDelay: "0.6s" }}
      >
        🎥 @sarahsnaps · 8.2K
      </div>
      <div
        className="float-chip absolute -right-6 -top-3 z-20 opacity-0 animate-float-medium rounded-full border border-coral/30 bg-coral/[0.07] px-4 py-2 text-xs font-semibold text-coral backdrop-blur-md"
        style={{ animationDelay: "1.1s" }}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-coral" />
        Live Campaign
      </div>
      <div
        className="float-chip absolute -bottom-6 -left-10 z-20 opacity-0 animate-float-fast rounded-full border border-teal/25 bg-teal/[0.07] px-4 py-2 text-xs font-semibold text-teal backdrop-blur-md"
        style={{ animationDelay: "0.3s" }}
      >
        +$1.2K earned 💸
      </div>
      <div
        className="float-chip absolute -right-8 bottom-10 z-20 opacity-0 animate-float-medium rounded-full border border-violet/25 bg-violet/[0.07] px-4 py-2 text-xs font-semibold text-violet backdrop-blur-md"
        style={{ animationDelay: "1.5s" }}
      >
        ✨ 3 brand deals
      </div>

      {/* Card glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-coral/10 via-violet/8 to-teal/8 blur-2xl" />

      {/* Main card */}
      <div className="dashboard-frame relative opacity-0 rounded-[2.5rem] border border-gray-200 bg-white p-6 shadow-dashboard-light">
        {/* Top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[2.5rem] bg-gradient-to-r from-coral via-violet to-teal" />

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            {summaryPanel.label}
          </p>
          <p className="mt-2.5 text-xl font-bold text-gray-900">{summaryPanel.title}</p>
          <p className="text-sm text-gray-500">{summaryPanel.subtitle}</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {summaryPanel.stats.map((stat) => {
              const tone = stat.tone ?? "slate";
              return (
                <div
                  key={stat.label}
                  className={`dashboard-stat rounded-2xl border p-3.5 opacity-0 ${toneBg[tone]}`}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {stat.label}
                  </p>
                  <p className={`mt-1.5 text-base font-bold ${toneValue[tone]}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-footer mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 opacity-0">
            <p className="font-semibold text-gray-900">{summaryPanel.footerCard.title}</p>
            <p className="mt-0.5 text-xs text-gray-400">{summaryPanel.footerCard.subtitle}</p>
            <p className="mt-2 text-sm font-medium text-gray-600">{summaryPanel.footerCard.detail}</p>
            <button
              type="button"
              className="mt-3 w-full rounded-full bg-gradient-to-r from-coral to-violet py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              {summaryPanel.footerCard.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
