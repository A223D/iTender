"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = pathname === "/";
  const isChooser = isHomePage && homeView === "chooser";
  const isCreatorHome = isHomePage && homeView === "creator";
  const isBusinessHome = isHomePage && homeView === "business";
  const homeNavLinks = getHomeNavLinks(homeView);
  const hasHomeNav = isCreatorHome || isBusinessHome;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
            S
          </div>
          <div>
            <p className="font-sans text-lg font-semibold tracking-tight text-gray-900">Scout</p>
            <p className="text-sm text-gray-400">Micro-influencer collaborations</p>
          </div>
        </Link>

        {/* Desktop nav */}
        {hasHomeNav ? (
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {homeNavLinks.map((link) =>
              link.href ? (
                <Link key={link.label} href={link.href} className="text-gray-500 transition hover:text-gray-900">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} type="button" className="text-gray-500 transition hover:text-gray-900">
                  {link.label}
                </button>
              ),
            )}
            {isCreatorHome ? (
              <HomeAudienceLink audience="business" className="font-medium text-violet/80 transition hover:text-violet">
                Switch to Business
              </HomeAudienceLink>
            ) : null}
            {isBusinessHome ? (
              <HomeAudienceLink audience="creator" className="font-medium text-violet/80 transition hover:text-violet">
                Switch to Creator
              </HomeAudienceLink>
            ) : null}
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          {isChooser ? (
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-semibold text-gray-900 transition hover:text-violet"
              >
                Login
              </button>
            </div>
          ) : null}

          {hasHomeNav ? (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-full bg-gradient-to-r from-coral to-violet px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
            >
              {isCreatorHome ? "Join as Creator ✨" : "Join as a Business 🚀"}
            </button>
          ) : null}

          {/* Mobile hamburger */}
          {hasHomeNav ? (
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:hidden"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l14 14M16 2L2 16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 4h14M2 9h14M2 14h14" />
                </svg>
              )}
            </button>
          ) : null}
        </div>

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
                      isActive ? "text-gray-900" : "text-gray-500"
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

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && hasHomeNav ? (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {homeNavLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  {link.label}
                </button>
              ),
            )}
            {isCreatorHome ? (
              <HomeAudienceLink
                audience="business"
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-violet transition hover:bg-violet/[0.05]"
              >
                Switch to Business Mode
              </HomeAudienceLink>
            ) : null}
            {isBusinessHome ? (
              <HomeAudienceLink
                audience="creator"
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-violet transition hover:bg-violet/[0.05]"
              >
                Switch to Creator Mode
              </HomeAudienceLink>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
