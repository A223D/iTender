import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Dashboard",
  description: "Manage Scout campaigns and creator applications.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
