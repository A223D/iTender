import { CampaignBoard } from "@/components/discover/campaign-board";
import { NavBar } from "@/components/discover/nav-bar";

export default function DiscoverCampaignsPage() {
  return (
    <main className="min-h-screen lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <NavBar />
      <CampaignBoard />
    </main>
  );
}
