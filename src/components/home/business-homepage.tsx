import Link from "next/link";

const businessBenefits = [
  {
    title: "Clear campaign intake",
    description:
      "Define the content format, budget range, brand fit, and deliverables once instead of repeating the brief across DMs and spreadsheets.",
  },
  {
    title: "Qualified creator discovery",
    description:
      "Review creators who actively want the job rather than chasing cold outreach lists that may never respond or match the campaign.",
  },
  {
    title: "Structured collaboration flow",
    description:
      "Keep briefs, bids, and creator applications in one system so collaboration decisions are easier to compare and manage.",
  },
];

const businessSteps = [
  {
    title: "Publish a campaign brief",
    description:
      "Create a campaign for a reel, story, post, or other deliverable with the expectations and budget that matter to your business.",
  },
  {
    title: "Review interested creators",
    description:
      "Scout gives you a cleaner pipeline of creators who import their profiles and apply to campaigns that fit their niche.",
  },
  {
    title: "Choose the right collaboration",
    description:
      "Compare applicants, align on compensation, and move forward without juggling inbox threads, scattered notes, and vague deliverables.",
  },
];

const campaignFormats = ["Instagram Reels", "Stories", "Static Posts", "Product Seeding", "Paid Partnerships"];

export function BusinessHomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl rounded-[40px] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08))] px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-1 py-6">
            <div className="inline-flex items-center rounded-full border border-[#D0DAD0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#455C3E] shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
              Scout for businesses
            </div>
            <h1 className="mt-6 max-w-4xl font-sans text-5xl font-semibold leading-[1.02] tracking-[-1.5px] text-[#333333] sm:text-6xl lg:text-7xl">
              Publish influencer campaigns without running your whole marketing workflow from your inbox.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#888888] sm:text-lg">
              Scout helps small businesses post structured campaign briefs, attract relevant micro-influencers, and
              review applicants in one place before choosing the right collaboration.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/discover-campaigns"
                className="inline-flex items-center justify-center rounded-xl bg-[#455C3E] px-6 py-3 text-sm font-semibold text-[#F5F5F5] shadow-[0_6px_20px_rgba(28,28,28,0.10)] transition hover:bg-[#3B4E35]"
              >
                Explore live campaigns
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-[#D0DAD0] bg-white px-6 py-3 text-sm font-semibold text-[#333333] transition hover:border-[#455C3E]"
              >
                How it works
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Built for</p>
                <p className="mt-2 text-lg font-semibold text-[#333333]">Small businesses</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(28,28,28,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Primary use</p>
                <p className="mt-2 text-lg font-semibold text-[#333333]">Campaign hiring</p>
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
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Business view</p>
                    <p className="mt-2 text-2xl font-semibold">Weekend brunch creator launch</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">6 bids live</div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Deliverable</p>
                    <p className="mt-2 text-lg font-semibold">Instagram Reel</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Budget cap</p>
                    <p className="mt-2 text-lg font-semibold">INR 20,000</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl bg-[#E8EDE7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">What businesses get</p>
                  <p className="mt-3 text-sm leading-7 text-[#333333]">
                    A cleaner campaign pipeline with structured briefs, creator interest, and clearer selection steps
                    before the collaboration starts.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {campaignFormats.map((item) => (
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
            {businessBenefits.map((benefit) => (
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
            A campaign workflow built for businesses that want structure, not inbox chaos.
          </h2>
          <p className="mt-4 text-base leading-8 text-[#888888]">
            Scout gives small teams a more usable way to brief creators, evaluate interest, and move toward a real
            collaboration decision.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {businessSteps.map((step, index) => (
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">For small business teams</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.5px] sm:text-4xl">
              Start discovering how Scout can organize creator hiring before the product expands further.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
              The campaign board is live today. Profile imports, applications, and deeper collaboration workflows can
              layer on top of the same structure.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/discover-campaigns"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#333333] transition hover:bg-[#F5F5F5]"
            >
              View campaign board
            </Link>
            <a
              href="#top"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to top
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
