"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { HomeAudienceLink } from "@/components/home/home-audience-link";
import { HomeAudienceSwitcher } from "@/components/home/home-audience-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
      { label: "Product", href: "#features" },
      { label: "Power user", href: "#power" },
      { label: "Web + mobile", href: "#split" },
      { label: "How it works", href: "#how" },
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
    <header className="glass sticky top-0 z-30 rounded-none border-t-0 border-b border-b-white/10 dark:border-b-white/10">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl glass">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Scout logo" width={24} height={24} className="dark:invert" />
          </div>
          <div>
            <p className="font-sans text-base font-bold text-[var(--color-text)]">Scout</p>
            <p className="text-xs text-[var(--color-text-muted)]">Micro-influencer collaborations</p>
          </div>
        </Link>

        {/* Desktop nav */}
        {hasHomeNav ? (
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {homeNavLinks.map((link) =>
              link.href ? (
                <Link key={link.label} href={link.href} className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} type="button" className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]">
                  {link.label}
                </button>
              ),
            )}
            {isCreatorHome ? (
              <HomeAudienceLink audience="business" className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]">
                Switch to Business
              </HomeAudienceLink>
            ) : null}
            {isBusinessHome ? (
              <HomeAudienceLink audience="creator" className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]">
                Switch to Creator
              </HomeAudienceLink>
            ) : null}
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isChooser ? (
            <div className="text-sm text-[var(--color-text-muted)]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-semibold text-[var(--color-text)] transition hover:opacity-70"
              >
                Login
              </button>
            </div>
          ) : null}

          {isBusinessHome ? (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              Login
            </button>
          ) : null}

          {hasHomeNav ? (
            isCreatorHome ? (
              <a
                href="#"
                className="rounded-full bg-[var(--color-text)] px-5 py-2 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
              >
                Join as Creator
              </a>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login?audience=business")}
                className="rounded-full bg-[var(--color-text)] px-5 py-2 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
              >
                Get started
              </button>
            )
          ) : null}

          {/* Mobile hamburger */}
          {hasHomeNav ? (
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass text-[var(--color-text)] transition hover:opacity-70 lg:hidden"
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
                    className={`text-sm font-semibold transition hover:opacity-70 ${
                      isActive ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
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
        <div className="border-t border-white/10 px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {homeNavLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--color-text)]"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--color-text)]"
                >
                  {link.label}
                </button>
              ),
            )}
            {isCreatorHome ? (
              <HomeAudienceLink
                audience="business"
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-white/[0.06]"
              >
                Switch to Business Mode
              </HomeAudienceLink>
            ) : null}
            {isBusinessHome ? (
              <HomeAudienceLink
                audience="creator"
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-white/[0.06]"
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
