import type { Metadata } from "next";

import { isAudience, type Audience } from "@/lib/audience";
import { publicPageMetadata } from "@/lib/seo";
import { WaitlistPageContent } from "@/components/home/waitlist-page-content";

export const metadata: Metadata = publicPageMetadata({
  title: "Join the Scout Waitlist",
  description: "Be among the first to try Scout, the link between creators and local businesses.",
  path: "/waitlist",
  image: "/og/scout-og-waitlist.png",
});

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialAudience: Audience | undefined = isAudience(role) ? role : undefined;

  return <WaitlistPageContent initialAudience={initialAudience} />;
}
