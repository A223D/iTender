"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { audienceCookieName, type Audience } from "@/lib/audience";

const options: Array<{
  value: Audience;
  eyebrow: string;
  title: string;
  description: string;
}> = [
  {
    value: "creator",
    eyebrow: "For creators",
    title: "I’m a creator",
    description:
      "Show the version of Scout focused on finding paid and in-kind brand collaborations that fit my audience.",
  },
  {
    value: "business",
    eyebrow: "For businesses",
    title: "I’m a business",
    description:
      "Show the version of Scout focused on publishing campaigns and reviewing creator applicants in one place.",
  },
];

function persistAudienceSelection(audience: Audience) {
  document.cookie = `${audienceCookieName}=${audience}; path=/; max-age=31536000; samesite=lax`;
}

export function AudienceQuestionnaire() {
  const router = useRouter();
  const [pendingAudience, setPendingAudience] = useState<Audience | null>(null);

  function handleSelect(audience: Audience) {
    setPendingAudience(audience);
    persistAudienceSelection(audience);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-[36px] border border-[#D0DAD0] bg-white/85 p-6 shadow-[0_16px_40px_rgba(28,28,28,0.08)] backdrop-blur sm:p-8 lg:p-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#455C3E]">Choose your Scout view</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-1px] text-[#333333] sm:text-5xl">
            Are you here as a creator or a business?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#888888] sm:text-lg">
            Scout adapts the homepage based on who is visiting. Pick the version you want to see first. You can change
            this anytime from the navbar.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {options.map((option) => {
            const isPending = pendingAudience === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="group rounded-[30px] border border-[#D0DAD0] bg-[#F9FAF8] p-6 text-left shadow-[0_8px_24px_rgba(28,28,28,0.05)] transition hover:border-[#455C3E] hover:bg-white"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">{option.eyebrow}</p>
                <h2 className="mt-4 text-2xl font-semibold text-[#333333]">{option.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#666666]">{option.description}</p>
                <span className="mt-8 inline-flex items-center text-sm font-semibold text-[#455C3E] group-hover:underline group-hover:underline-offset-4">
                  {isPending ? "Loading selection..." : "Continue"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
