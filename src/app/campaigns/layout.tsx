import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Campaigns",
  description: "Create and manage Scout campaigns.",
};

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
