"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeAudienceSwitcher } from "@/components/home/home-audience-switcher";
import type { Audience } from "@/lib/audience";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover-campaigns", label: "Discover Campaigns" },
];

type NavBarProps = {
  initialAudience?: Audience | null;
};

export function NavBar({ initialAudience = null }: NavBarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

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

        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          <nav aria-label="Primary navigation" className="flex items-center gap-6">
            {navLinks.map((link) => {
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
      </div>
    </header>
  );
}
