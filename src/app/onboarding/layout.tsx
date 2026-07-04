import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Onboarding",
  description: "Set up a Scout business profile.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
