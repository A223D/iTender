"use client";

import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    const html = document.documentElement;
    if (next) {
      html.classList.add("dark");
      html.classList.remove("light");
      localStorage.setItem("scout-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      localStorage.setItem("scout-theme", "light");
    }
    setIsDark(next);
  }

  // Reserve space while determining initial theme (avoids layout shift)
  if (isDark === null) {
    return <div className="h-7 w-[52px] shrink-0 rounded-full" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={`relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        isDark
          ? "border-white/15 bg-white/[0.09]"
          : "border-black/10 bg-black/[0.06]"
      }`}
    >
      {/* Knob — slides left (light) ↔ right (dark) */}
      <span
        className={`absolute flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          isDark
            ? "translate-x-[28px] bg-slate-800 text-fuchsia-300"
            : "translate-x-1 bg-white text-amber-500"
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
