"use client";

import { useState } from "react";

import { useAudienceSelection } from "@/components/home/use-audience-selection";
import { type Audience } from "@/lib/audience";

type HomeAudienceSwitcherProps = {
  initialAudience: Audience | null;
};

const options: Audience[] = ["creator", "business"];

export function HomeAudienceSwitcher({ initialAudience }: HomeAudienceSwitcherProps) {
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(initialAudience);
  const selectAudience = useAudienceSelection();

  function handleSelect(audience: Audience) {
    setSelectedAudience(audience);
    selectAudience(audience);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#888888] md:inline">
        View as
      </span>
      <div className="inline-flex rounded-full border border-[#D0DAD0] bg-white/80 p-1 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
        {options.map((option) => {
          const isActive = selectedAudience === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition ${
                isActive ? "bg-[#455C3E] text-white" : "text-[#666666] hover:text-[#333333]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
