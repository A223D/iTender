import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Admin",
  description: "Scout admin tools.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
