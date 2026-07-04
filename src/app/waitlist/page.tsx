import type { Metadata } from "next";

import { isAudience, type Audience } from "@/lib/audience";
import { WaitlistPageContent } from "@/components/home/waitlist-page-content";

export const metadata: Metadata = {
  title: "Join the Scout Waitlist",
  description: "Be among the first to try Scout — the link between creators and local businesses.",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialAudience: Audience | undefined = isAudience(role) ? role : undefined;

  return <WaitlistPageContent initialAudience={initialAudience} />;
}
