import { cookies } from "next/headers";

import { CampaignBoard } from "@/components/discover/campaign-board";
import { NavBar } from "@/components/discover/nav-bar";
import { audienceCookieName, getSelectedAudience } from "@/lib/audience";

export default async function DiscoverCampaignsPage() {
  const cookieStore = await cookies();
  const selectedAudience = getSelectedAudience(cookieStore.get(audienceCookieName)?.value);

  return (
    <main className="min-h-screen lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <NavBar initialAudience={selectedAudience} />
      <CampaignBoard />
    </main>
  );
}
