import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Settings",
  description: "Manage Scout account settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
