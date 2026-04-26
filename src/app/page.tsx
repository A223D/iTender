import Link from "next/link";

import { NavBar } from "@/components/discover/nav-bar";

const collaborationTypes = ["Instagram Reels", "Stories", "Static Posts", "Paid Partnerships", "In-Kind Trade"];

const benefits = [
  {
    title: "For small businesses",
    description:
      "Post a campaign once, define the content you need, and review creator applicants in one place instead of managing DMs, spreadsheets, and cold outreach.",
  },
  {
    title: "For micro-influencers",
    description:
      "Import your social profiles, showcase your audience fit, and apply to collaboration opportunities that are actually designed for creators at your stage.",
  },
  {
    title: "For better matches",
    description:
      "Scout keeps briefs, content expectations, platform requirements, and payment terms visible from the start so both sides evaluate the same opportunity clearly.",
  },
];

const steps = [
  {
    title: "Businesses publish a campaign",
    description:
      "A business posts the brief, selects the deliverable type, and sets whether compensation is paid in cash, in kind, or a mix of both.",
  },
  {
    title: "Influencers import profiles and apply",
    description:
      "Creators connect their presence, highlight their niche, and apply to the campaigns that fit their audience and content style.",
  },
  {
    title: "Both sides choose the right collaboration",
    description:
      "Businesses review applicants, select a creator, and move forward with a clearer collaboration workflow than scattered messages and manual coordination.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] text-[#333333]">
      <NavBar />

      <section className="mx-auto max-w-7xl rounded-[40px] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08))] px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-1 py-6">
            <div className="inline-flex items-center rounded-full border border-[#D0DAD0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#455C3E] shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
              Marketplace for small business collaborations
            </div>
            <h1 className="mt-6 max-w-4xl font-sans text-5xl font-semibold leading-[1.02] tracking-[-1.5px] text-[#333333] sm:text-6xl lg:text-7xl">
              Scout helps local brands find the right micro-influencers to create content that actually fits.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#888888] sm:text-lg">
              Small businesses post collaboration briefs for reels, stories, and social posts. Influencers import
              their profiles, apply to relevant campaigns, and get selected for paid or in-kind partnerships.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/discover-campaigns"
                className="inline-flex items-center justify-center rounded-xl bg-[#455C3E] px-6 py-3 text-sm font-semibold text-[#F5F5F5] shadow-[0_6px_20px_rgba(28,28,28,0.10)] transition hover:bg-[#3B4E35]"
              >
                Explore Campaigns
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-[#D0DAD0] bg-white px-6 py-3 text-sm font-semibold text-[#333333] transition hover:border-[#455C3E]"
              >
                How It Works
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Built for</p>
                <p className="mt-2 text-lg font-semibold text-[#333333]">Small businesses</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Focused on</p>
                <p className="mt-2 text-lg font-semibold text-[#333333]">Micro-influencers</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Compensation</p>
                <p className="mt-2 text-lg font-semibold text-[#333333]">Cash or in-kind</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 hidden h-28 w-28 rounded-full bg-[#ACC8A3]/45 blur-2xl lg:block" />
            <div className="absolute -right-8 bottom-10 hidden h-36 w-36 rounded-full bg-[#D19FA5]/35 blur-3xl lg:block" />

            <div className="relative rounded-[28px] border border-[#D0DAD0] bg-white p-6 shadow-[0_12px_30px_rgba(28,28,28,0.08)]">
              <div className="rounded-[24px] bg-[#333333] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Campaign snapshot</p>
                    <p className="mt-2 text-2xl font-semibold">Weekend brunch creator launch</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Live brief</div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Deliverable</p>
                    <p className="mt-2 text-lg font-semibold">Instagram Reel</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Compensation</p>
                    <p className="mt-2 text-lg font-semibold">Cash + hosted meal</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl bg-[#E8EDE7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">What Scout solves</p>
                  <p className="mt-3 text-sm leading-7 text-[#333333]">
                    Clear campaign briefs, cleaner creator discovery, and a more structured collaboration workflow for
                    businesses that are too small for agency overhead but too serious for scattered outreach.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {collaborationTypes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#ACC8A3] px-4 py-2 text-xs font-semibold text-[#333333]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-3xl border border-[#D0DAD0] bg-white p-6 shadow-[0_2px_10px_rgba(28,28,28,0.05)]"
              >
                <p className="text-lg font-semibold text-[#333333]">{benefit.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#888888]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#455C3E]">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.5px] text-[#333333] sm:text-4xl">
            A simpler way to turn creator marketing into an actual workflow.
          </h2>
          <p className="mt-4 text-base leading-8 text-[#888888]">
            Scout is designed for businesses that need structured campaign discovery, and for creators who want clearer
            briefs than a vague Instagram DM.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[28px] border border-[#D0DAD0] bg-white p-6 shadow-[0_4px_12px_rgba(28,28,28,0.05)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D19FA5] to-[#E07070] text-lg font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#333333]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#888888]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#455C3E] px-6 py-10 text-[#F5F5F5] shadow-[0_16px_32px_rgba(28,28,28,0.12)] sm:px-8 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Launching Scout</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.5px] sm:text-4xl">
              Build a stronger collaboration pipeline before the inbox chaos starts.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
              Start with campaign discovery today, then grow into applications, profile imports, and collaboration
              management as the product expands.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/discover-campaigns"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#333333] transition hover:bg-[#F5F5F5]"
            >
              View Campaign Board
            </Link>
            <a
              href="#top"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Top
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
