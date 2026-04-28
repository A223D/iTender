import type { HomePageTemplateProps } from "@/components/home/homepage-template";

const sharedWhyScoutCards: HomePageTemplateProps["whyScoutCards"] = [
  {
    title: "Better Matches",
    description: "Creators and businesses connect based on niche, goals, and mutual fit.",
  },
  {
    title: "Clear Expectations",
    description: "Deliverables, compensation, and timelines are visible from the start.",
  },
  {
    title: "Streamlined Outreach",
    description: "Replace scattered DMs and cold emails with one streamlined platform.",
  },
];

export const creatorHomePageContent: HomePageTemplateProps = {
  badge: "Get Paid to Post What You Love!",
  title: "Get discovered by local businesses that fit your niche and want to work with creators like you",
  description: "Browse paid campaigns, gifted collabs, and local partnerships built for micro-creators.",
  highlightCards: [
    {
      title: "Focus",
      items: ["Food", "Fitness", "Fashion", "Lifestyle"],
    },
    {
      title: "Compensation",
      items: ["Cash", "Free Products", "Experiences"],
    },
    {
      title: "Deliverables",
      items: ["Reels", "Stories", "TikToks", "Photos"],
    },
  ],
  primaryActionLabel: "Edit Profile",
  secondaryActionLabel: "View My Stats",
  summaryPanel: {
    label: "Profile summary",
    title: "@yourhandle",
    subtitle: "Lifestyle Creator",
    stats: [
      { label: "Earned", value: "+$450", tone: "rose" },
      { label: "Reach Growth", value: "+1.2K", tone: "emerald" },
      { label: "Brand Deals", value: "3" },
      { label: "Active Campaigns", value: "4" },
    ],
    footerCard: {
      title: "Bloom Cafe",
      subtitle: "Need 2 food creators",
      detail: "$120 + free brunch",
      actionLabel: "Apply",
    },
  },
  howItWorksDescription:
    "A clear path for creators to discover, apply, and grow through local brand partnerships.",
  howItWorksCards: [
    {
      title: "Build Your Profile",
      description: "Import socials, showcase your niche, audience, and content style.",
    },
    {
      title: "Apply to Campaigns",
      description: "Browse paid and in-kind local opportunities that match your vibe.",
    },
    {
      title: "Collaborate & Grow",
      description: "Get selected, create content, and build long-term brand relationships.",
    },
  ],
  whyScoutDescription:
    "Built to make creator-business partnerships easier, clearer, and more effective for everyone.",
  whyScoutCards: sharedWhyScoutCards,
  footerLinkLabel: "Browse Campaigns",
  footerLinkHref: "/discover-campaigns",
};

export const businessHomePageContent: HomePageTemplateProps = {
  badge: "Get Local Buzz for Your Brand!",
  title: "Find local creators that fit your brand and are ready to promote your business",
  description:
    "Launch paid or gifted campaigns, review applicants, and grow through influencer partnerships. Reach your future customers through creators they trust!",
  highlightCards: [
    {
      title: "Campaign Goals",
      items: ["Awareness", "Traffic", "Sales", "Launches"],
    },
    {
      title: "Budget Types",
      items: ["Paid", "Gifted/In-Kind", "Hybrid"],
    },
    {
      title: "Content Types",
      items: ["Reels", "Stories", "TikToks", "Photos"],
    },
  ],
  primaryActionLabel: "Create New Campaign",
  secondaryActionLabel: "View Dashboard",
  summaryPanel: {
    label: "Campaign summary",
    title: "Bloom Cafe",
    subtitle: "Local Cafe Brand",
    stats: [
      { label: "Applicants", value: "24", tone: "rose" },
      { label: "Total Reach", value: "18K", tone: "emerald" },
      { label: "Creators Selected", value: "3" },
      { label: "Campaigns Live", value: "2" },
    ],
    footerCard: {
      title: "@sarahsnaps",
      subtitle: "Food Creator • 8.2K Followers",
      detail: "See creator profile",
      actionLabel: "Invite",
    },
  },
  howItWorksDescription:
    "A simple workflow for businesses to launch campaigns, review creators, and grow through trusted partnerships.",
  howItWorksCards: [
    {
      title: "Create Your Campaign",
      description: "Set your goals, budget, deliverables, and the type of creator you want to work with.",
    },
    {
      title: "Review Creator Applicants",
      description: "Compare creator profiles, audience fit, content style, and campaign alignment in one place.",
    },
    {
      title: "Launch & Grow",
      description: "Choose creators, launch campaigns, and turn creator attention into real customers.",
    },
  ],
  whyScoutDescription:
    "Built to make creator-business partnerships easier, clearer, and more effective for everyone.",
  whyScoutCards: sharedWhyScoutCards,
};
