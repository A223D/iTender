import { cookies } from "next/headers";

import { AudienceQuestionnaire } from "@/components/home/audience-questionnaire";
import { BusinessHomePage } from "@/components/home/business-homepage";
import { CreatorHomePage } from "@/components/home/creator-homepage";
import { NavBar } from "@/components/discover/nav-bar";
import { audienceCookieName, isAudience } from "@/lib/audience";

export default async function HomePage() {
  const cookieStore = await cookies();
  const audienceValue = cookieStore.get(audienceCookieName)?.value;
  const selectedAudience = isAudience(audienceValue) ? audienceValue : null;

  return (
    <main id="top" className="min-h-screen bg-[#F5F5F5] text-[#333333]">
      <NavBar initialAudience={selectedAudience} />
      {selectedAudience === "creator" ? <CreatorHomePage /> : null}
      {selectedAudience === "business" ? <BusinessHomePage /> : null}
      {selectedAudience === null ? <AudienceQuestionnaire /> : null}
    </main>
  );
}
