"use client";

import { type ReactNode } from "react";

import { useAudienceSelection } from "@/components/home/use-audience-selection";
import { type Audience } from "@/lib/audience";

type HomeAudienceLinkProps = {
  audience: Audience;
  children: ReactNode;
  className?: string;
};

export function HomeAudienceLink({ audience, children, className }: HomeAudienceLinkProps) {
  const selectAudience = useAudienceSelection();

  function handleClick() {
    selectAudience(audience, { destination: "/" });
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
