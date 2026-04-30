"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeAudienceLink } from "@/components/home/home-audience-link";
import { HomeAudienceSwitcher } from "@/components/home/home-audience-switcher";
import type { Audience, HomeView } from "@/lib/audience";

const appNavLinks = [{ href: "/", label: "Home" }];

type HomeNavItem = {
  label: string;
  href?: string;
};

type NavBarProps = {
  initialAudience?: Audience | null;
  homeView?: HomeView | null;
};

function getHomeNavLinks(homeView: HomeView | null): HomeNavItem[] {
  if (homeView === "creator") {
    return [
      { label: "Home", href: "/" },
      { label: "Why Scout?", href: "#why-scout" },
      { label: "How it Works", href: "#how-it-works" },
    ];
  }

  if (homeView === "business") {
    return [
      { label: "Home", href: "/" },
      { label: "Why Scout?", href: "#why-scout" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Browse Creators" },
    ];
  }

  return [];
}

export function NavBar({ initialAudience = null, homeView = null }: NavBarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isChooser = isHomePage && homeView === "chooser";
  const isCreatorHome = isHomePage && homeView === "creator";
  const isBusinessHome = isHomePage && homeView === "business";
  const homeNavLinks = getHomeNavLinks(homeView);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-black/5 backdrop-blur-xl ${
        isHomePage ? "relative isolate overflow-hidden bg-[#F5F5F5]/92" : "bg-[#F5F5F5]/90"
      }`}
    >
      {isHomePage ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="scout-showlight absolute left-[4%] top-[-180%] h-[18rem] w-[18rem] bg-[linear-gradient(180deg,rgba(69,92,62,0.5)_0%,rgba(172,200,163,0.34)_26%,rgba(172,200,163,0)_78%)] blur-[34px]" />
          <div className="scout-showlight scout-showlight-delay-1 absolute left-[18%] top-[-170%] h-[16rem] w-[16rem] bg-[linear-gradient(180deg,rgba(246,196,83,0.42)_0%,rgba(246,196,83,0.18)_28%,rgba(246,196,83,0)_80%)] blur-[18px]" />
          <div className="scout-showlight-reverse scout-showlight-delay-1 absolute left-[30%] top-[-190%] h-[20rem] w-[20rem] bg-[linear-gradient(180deg,rgba(224,112,112,0.42)_0%,rgba(209,159,165,0.28)_68%,rgba(209,159,165,0)_78%)] blur-[20px]" />
          <div className="scout-showlight-sweep scout-showlight-delay-2 absolute left-[44%] top-[-178%] h-[17rem] w-[17rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.36)_75%,rgba(255,255,255,0)_76%)] blur-[18px]" />
          <div className="scout-showlight scout-showlight-delay-4 absolute left-[56%] top-[-165%] h-[16rem] w-[16rem] bg-[linear-gradient(180deg,rgba(172,200,163,0.52)_0%,rgba(172,200,163,0.24)_72%,rgba(172,200,163,0)_80%)] blur-[18px]" />
          <div className="scout-showlight-reverse scout-showlight-soft scout-showlight-delay-5 absolute left-[68%] top-[-186%] h-[18rem] w-[18rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.42)_72%,rgba(255,255,255,0)_78%)] blur-[16px]" />
          <div className="scout-showlight-sweep scout-showlight-delay-3 absolute right-[2%] top-[-180%] h-[18rem] w-[18rem] bg-[linear-gradient(180deg,rgba(69,92,62,0.28)_0%,rgba(172,200,163,0.22)_80%,rgba(172,200,163,0)_78%)] blur-[20px]" />
          <div className="absolute left-[8%] top-[-35%] h-16 w-16 rounded-full bg-white/90 blur-[20px]" />
          <div className="absolute left-[22%] top-[-28%] h-12 w-12 rounded-full bg-[#F6C453]/76 blur-[18px]" />
          <div className="absolute left-[36%] top-[-45%] h-20 w-20 rounded-full bg-[#F7D3D3]/78 blur-[24px]" />
          <div className="absolute left-[49%] top-[-22%] h-10 w-10 rounded-full bg-[#FFF6D0]/90 blur-[14px]" />
          <div className="absolute left-[61%] top-[-28%] h-14 w-14 rounded-full bg-white/95 blur-[18px]" />
          <div className="absolute left-[73%] top-[-36%] h-16 w-16 rounded-full bg-[#E8FFD8]/74 blur-[22px]" />
          <div className="absolute right-[10%] top-[-34%] h-16 w-16 rounded-full bg-[#DDF0D6]/70 blur-[24px]" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D19FA5] to-[#E07070] text-sm font-bold text-white shadow-[0_6px_20px_rgba(28,28,28,0.12)]">
            S
          </div>
          <div>
            <p className="font-sans text-lg font-semibold tracking-tight text-[#333333]">Scout</p>
            <p className="text-sm text-[#888888]">Micro-influencer collaborations</p>
          </div>
        </Link>

        {isChooser ? (
          <div className="text-sm text-slate-500">
            Already have an account?{" "}
            <button type="button" className="font-semibold text-slate-800">
              Login
            </button>
          </div>
        ) : null}

        {isCreatorHome || isBusinessHome ? (
          <>
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex"
            >
              {homeNavLinks.map((link) =>
                link.href ? (
                  <Link key={link.label} href={link.href} className="transition hover:text-slate-900">
                    {link.label}
                  </Link>
                ) : (
                  <button key={link.label} type="button" className="transition hover:text-slate-900">
                    {link.label}
                  </button>
                ),
              )}

              {isCreatorHome ? (
                <HomeAudienceLink
                  audience="business"
                  className="font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Switch to Business Mode
                </HomeAudienceLink>
              ) : null}

              {isBusinessHome ? (
                <HomeAudienceLink
                  audience="creator"
                  className="font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Switch to Creator Mode
                </HomeAudienceLink>
              ) : null}
            </nav>

            <button
              type="button"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isCreatorHome ? "Join as Creator" : "Join as a Business"}
            </button>
          </>
        ) : null}

        {!isHomePage ? (
          <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
            <nav aria-label="Primary navigation" className="flex items-center gap-6">
              {appNavLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-sm font-semibold transition hover:underline hover:underline-offset-4 ${
                      isActive ? "text-[#333333]" : "text-[#888888]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <HomeAudienceSwitcher key={initialAudience ?? "unset"} initialAudience={initialAudience} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
