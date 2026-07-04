import type { Metadata } from "next";

import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: "Log in",
  description: "Log in to Scout.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
