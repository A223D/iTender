"use client";

import { useState } from "react";

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
    title: "Creator",
    description: "Work and grow with local brands",
    badge: "🎥",
  },
  {
    value: "business",
    title: "Business",
    description: "Find creators to grow your brand",
    badge: "🏪",
  },
];

export function AudienceQuestionnaire() {
  const [pendingAudience, setPendingAudience] = useState<Audience | null>(null);
  const selectAudience = useAudienceSelection();

  function handleSelect(audience: Audience) {
    setPendingAudience(audience);
    selectAudience(audience);
  }

  return (
    <section className="flex min-h-[calc(100vh-89px)] flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
            Built for Creators. Built for Businesses.
          </h1>
          <p className="mt-5 text-lg text-slate-500">
            Start your journey with Scout, where creators and businesses grow together locally.
          </p>
        </div>

        <p className="mb-6 text-center text-sm uppercase tracking-[0.25em] text-slate-400">I am a...</p>

        <div className="grid gap-6 md:grid-cols-2">
          {options.map((option) => {
            const isPending = pendingAudience === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="group rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-3xl">
                  {option.badge}
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-900">{option.title}</h2>
                <p className="mt-3 text-slate-500">{option.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-slate-800 group-hover:underline group-hover:underline-offset-4">
                  {isPending ? "Loading..." : "Continue"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
