import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Creators",
  description: "Review Scout creator profiles.",
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
