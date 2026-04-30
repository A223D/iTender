import { cookies } from "next/headers";

import { AudienceQuestionnaire } from "@/components/home/audience-questionnaire";
import { BusinessHomePage } from "@/components/home/business-homepage";
import { CreatorHomePage } from "@/components/home/creator-homepage";
import { NavBar } from "@/components/discover/nav-bar";
import { audienceCookieName, getSelectedAudience } from "@/lib/audience";

export default async function HomePage() {
  const cookieStore = await cookies();
  const selectedAudience = getSelectedAudience(cookieStore.get(audienceCookieName)?.value);

  return (
    <main id="top" className="min-h-screen bg-void">
      <NavBar
        initialAudience={selectedAudience}
        homeView={selectedAudience === null ? "chooser" : selectedAudience}
      />
      {selectedAudience === "creator" ? <CreatorHomePage /> : null}
      {selectedAudience === "business" ? <BusinessHomePage /> : null}
      {selectedAudience === null ? <AudienceQuestionnaire /> : null}
    </main>
  );
}
