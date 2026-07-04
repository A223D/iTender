"use client";

import { useEffect, useState } from "react";

import { BgStack } from "@/components/ui/bg-stack";
import { audienceCookieName, getAudienceCookieValue, isAudience, type Audience } from "@/lib/audience";
import {
  Nav,
  Footer,
  WaitlistSection,
  getWaitlistRole,
  getInitialTheme,
  setFavicon,
  WAITLIST_FORM_ID,
  type Theme,
  type WaitlistRole,
} from "@/components/home/landing-shared";

function getStoredAudience(): Audience {
  if (typeof window === "undefined") return "creator";
  const cookieValue = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${audienceCookieName}=`))
    ?.split("=")[1];
  if (isAudience(cookieValue)) return cookieValue;

  const saved = localStorage.getItem("scout-audience") ?? undefined;
  return isAudience(saved) ? saved : "creator";
}

function scrollToWaitlistForm() {
  const form = document.getElementById(WAITLIST_FORM_ID);
  if (!form) return;
  const nav = document.querySelector<HTMLElement>(".v2-nav");
  const navOffset = nav ? nav.getBoundingClientRect().height + 16 : 72;
  const top = Math.max(0, form.getBoundingClientRect().top + window.scrollY - navOffset);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

export function WaitlistPageContent({ initialAudience }: { initialAudience?: Audience }) {
  const [aud, setAud] = useState<Audience>(initialAudience ?? "creator");
  const [theme, setTheme] = useState<Theme>("dark");
  const [waitlistRole, setWaitlistRole] = useState<WaitlistRole>(getWaitlistRole(initialAudience ?? "creator"));

  // After mount, sync to stored audience/theme when no role was requested via URL (client-only)
  useEffect(() => {
    if (!initialAudience) {
      const storedAud = getStoredAudience();
      setAud(storedAud);
      setWaitlistRole(getWaitlistRole(storedAud));
    }
    setTheme(getInitialTheme());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("scout-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    setFavicon(theme);
  }, [theme]);

  function onJoinWaitlist(which: Audience) {
    setAud(which);
    setWaitlistRole(getWaitlistRole(which));
    localStorage.setItem("scout-audience", which);
    document.cookie = getAudienceCookieValue(which);
    window.requestAnimationFrame(() => window.requestAnimationFrame(scrollToWaitlistForm));
  }

  return (
    <>
      <BgStack />
      <Nav
        aud={aud}
        theme={theme}
        setTheme={setTheme}
        onJoinWaitlist={onJoinWaitlist}
        homeHref="/"
        sectionPrefix="/"
      />
      <WaitlistSection selectedRole={waitlistRole} onRoleChange={setWaitlistRole} />
      <Footer
        theme={theme}
        onJoinWaitlist={onJoinWaitlist}
        onShowHowItWorks={(which) => {
          localStorage.setItem("scout-audience", which);
          document.cookie = getAudienceCookieValue(which);
          window.location.href = "/#showcase";
        }}
        homeHref="/"
      />
    </>
  );
}
