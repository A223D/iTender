"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { getAudienceCookieValue, type Audience } from "@/lib/audience";

type SelectionOptions = {
  destination?: string;
};

export function useAudienceSelection() {
  const router = useRouter();

  return (audience: Audience, options?: SelectionOptions) => {
    document.cookie = getAudienceCookieValue(audience);

    startTransition(() => {
      if (options?.destination) {
        router.push(options.destination);
      }

      router.refresh();
    });
  };
}
