import Link from "next/link";

type HighlightCard = {
  title: string;
  items: string[];
};

type LandingStep = {
  title: string;
  description: string;
};

type LandingStat = {
  label: string;
  value: string;
  tone?: "rose" | "emerald" | "slate";
};

type SummaryCard = {
  title: string;
  subtitle: string;
  detail: string;
  actionLabel: string;
};

type SummaryPanel = {
  label: string;
  title: string;
  subtitle: string;
  stats: LandingStat[];
  footerCard: SummaryCard;
};

export type HomePageTemplateProps = {
  badge: string;
  title: string;
  description: string;
  highlightCards: HighlightCard[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  summaryPanel: SummaryPanel;
  howItWorksDescription: string;
  howItWorksCards: LandingStep[];
  whyScoutDescription: string;
  whyScoutCards: LandingStep[];
  footerLinkLabel?: string;
  footerLinkHref?: string;
};

const statToneClasses: Record<NonNullable<LandingStat["tone"]>, string> = {
  rose: "bg-rose-50",
  emerald: "bg-emerald-50",
  slate: "bg-slate-50",
};

function formatCardItems(items: string[]) {
  return items.join(" • ");
}

export function HomePageTemplate({
  badge,
  title,
  description,
  highlightCards,
  primaryActionLabel,
  secondaryActionLabel,
  summaryPanel,
  howItWorksDescription,
  howItWorksCards,
  whyScoutDescription,
  whyScoutCards,
  footerLinkLabel,
  footerLinkHref,
}: HomePageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50/30 text-slate-900">
      <main className="px-8 py-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-block rounded-full bg-rose-100 px-4 py-2 text-xs font-bold tracking-wide text-rose-500">
              {badge}
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-tight">{title}</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-500">{description}</p>

            <div className="mt-7 max-w-xl space-y-3">
              {highlightCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="font-medium">{card.title}</span>: {formatCardItems(card.items)}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                {primaryActionLabel}
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-6 py-3 font-semibold transition hover:border-slate-400"
              >
                {secondaryActionLabel}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-[340px] rounded-[2.5rem] border-8 border-slate-900 bg-white p-6 shadow-2xl">
              <div className="text-sm text-slate-400">{summaryPanel.label}</div>
              <div className="mt-2 text-xl font-bold">{summaryPanel.title}</div>
              <div className="text-slate-500">{summaryPanel.subtitle}</div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {summaryPanel.stats.map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-3 ${statToneClasses[stat.tone ?? "slate"]}`}>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                    <div className="font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 p-4">
                <div className="font-bold">{summaryPanel.footerCard.title}</div>
                <div className="mt-1 text-sm text-slate-500">{summaryPanel.footerCard.subtitle}</div>
                <div className="mt-2 text-sm font-semibold">{summaryPanel.footerCard.detail}</div>
                <div className="mt-4 rounded-full bg-rose-400 py-2 text-center font-semibold text-white">
                  {summaryPanel.footerCard.actionLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="how-it-works" className="border-t border-slate-100 bg-white px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold">How it Works</h2>
          <p className="mt-3 max-w-2xl text-slate-500">{howItWorksDescription}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {howItWorksCards.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 p-6">
                <div className="text-2xl font-bold">{index + 1}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-scout" className="bg-rose-50/40 px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold">Why Scout?</h2>
          <p className="mt-3 max-w-2xl text-slate-500">{whyScoutDescription}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {whyScoutCards.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>

          {footerLinkLabel && footerLinkHref ? (
            <div className="mt-12">
              <Link
                href={footerLinkHref}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                {footerLinkLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
