"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { BgStack } from "@/components/ui/bg-stack";
import {
  audienceCookieName,
  getAudienceCookieValue,
  isAudience,
  type Audience,
} from "@/lib/audience";
import {
  MockupMatches,
  MockupDashboard,
  MockupReview,
  MockupPhoneDiscover,
  MockupPhoneChat,
  MockupPhoneProfile,
  WindowFrame,
} from "@/components/home/landing-mockups";
import { Nav, Footer, type Theme, getInitialTheme, setFavicon } from "@/components/home/landing-shared";

// Runs as useLayoutEffect in the browser, useEffect on the server
const useIsomorphicLayoutEffect =
  typeof window !== "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("react").useLayoutEffect
    : useEffect;

// ── Inline icon SVGs ─────────────────────────────────────────────────────────

function IconStar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z" />
    </svg>
  );
}
function IconCampaigns({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconUser({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function IconMessages({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconGlobe({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Audience copy ────────────────────────────────────────────────────────────

const AUD = {
  creator: {
    label: "Creator",
    eyebrow: "GET PAID TO POST WHAT YOU LOVE",
    h: ["Scout: The Link Between", "Creators and", "Local Businesses."],
    sub: "Discover campaigns from restaurants, cafés, shops, local artisans, and other businesses looking for creators like you.",
    primary: "Download the app",
    secondary: "See how it works",
    note: "Free for creators · iOS & Android",
  },
  business: {
    label: "Business",
    eyebrow: "FIND THE VOICES YOUR CUSTOMERS TRUST",
    h: ["Scout: The Link Between", "Creators and", "Local Businesses."],
    sub: "Post opportunities, review applicants, and manage creator partnerships all in one place.",
    primary: "Start a campaign",
    secondary: "Tour the workspace",
    note: "Free while you launch your first campaign · no card",
  },
};

// ── Audience switch ──────────────────────────────────────────────────────────

function AudienceSwitch({ value, onChange }: { value: Audience; onChange: (a: Audience) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const creatorRef = useRef<HTMLButtonElement>(null);
  const businessRef = useRef<HTMLButtonElement>(null);
  const refs = { creator: creatorRef, business: businessRef };
  const [thumb, setThumb] = useState({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const el = refs[value].current;
    const wrap = wrapRef.current;
    if (el && wrap) {
      const er = el.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      setThumb({ left: er.left - wr.left, width: er.width });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useIsomorphicLayoutEffect(() => { measure(); }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div className="aud-switch glass" ref={wrapRef} role="tablist" aria-label="Choose your audience">
      <span className="aud-switch-thumb" style={{ left: thumb.left, width: thumb.width }} />
      {(["creator", "business"] as Audience[]).map((k) => (
        <button
          key={k}
          ref={refs[k]}
          role="tab"
          aria-selected={value === k}
          className={"aud-switch-btn scout-focus " + (value === k ? "active" : "")}
          onClick={() => onChange(k)}
        >
          <span className="ic">
            {k === "creator" ? <IconStar size={15} /> : <IconCampaigns size={15} />}
          </span>
          I&apos;m a {AUD[k].label}
        </button>
      ))}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ aud, setAud, onJoinWaitlist, theme }: { aud: Audience; setAud: (a: Audience) => void; onJoinWaitlist: (w: Audience) => void; theme: Theme }) {
  const a = AUD[aud];
  const isLight = theme === "light";

  const ghostBtnStyle = {
    padding: "12px 28px",
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.35)",
  };

  return (
    <section id="top" style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      padding: "0",
    }}>
      {/* Hero background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={aud === "business" ? "/busimg.png" : "/creatorimg.png"}
          alt="Hero"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
        {/* Overlay for text readability — lighter in light mode */}
        <div style={{
          position: "absolute", inset: 0,
          background: isLight
            ? "rgba(10,4,24,0.55)"
            : "rgba(10,4,24,0.65)",
        }} />
      </div>

      {/* Left: text content */}
      <div className="v2-container" style={{ position: "relative", zIndex: 5, paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            margin: "0 0 16px",
            textTransform: "uppercase",
          }} suppressHydrationWarning>
            {a.eyebrow}
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.8vw, 22px)",
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            margin: "0 0 8px",
          }}>
            <span style={{ color: "#d097ed" }}>Scout:</span> the link between creators and businesses
          </p>

          <p style={{
            fontSize: "clamp(15px, 1.4vw, 20px)",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            margin: "0 0 32px",
            maxWidth: 440,
          }}>
            {a.sub}
          </p>


          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <button type="button"
              className={"v2-btn " + (aud === "creator" ? "v2-btn-primary" : "v2-btn-ghost")}
              onClick={() => setAud("creator")}
              style={aud === "creator" ? { background: "#7c3aed", border: "none", padding: "12px 28px", fontSize: 15 } : ghostBtnStyle}>
              <IconStar size={15} /> I&apos;m a Creator
            </button>
            <button type="button"
              className={"v2-btn " + (aud === "business" ? "v2-btn-primary" : "v2-btn-ghost")}
              onClick={() => setAud("business")}
              style={aud === "business" ? { background: "#7c3aed", border: "none", padding: "12px 28px", fontSize: 15 } : ghostBtnStyle}>
              <IconCampaigns size={15} /> I&apos;m a Business
            </button>
          </div>

          <button
            type="button"
            onClick={() => onJoinWaitlist(aud)}
            style={{ background: "#ffffff", color: "#1a0533", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", marginBottom: 8, border: "none" }}>
            Join Scout
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Marquee ──────────────────────────────────────────────────────────────────

function Marquee() {
  const niches: [string, string][] = [
    ["🍕", "Food & drink"], ["💪", "Fitness"], ["👗", "Fashion"], ["✨", "Beauty"],
    ["🌿", "Wellness"], ["🏡", "Home"], ["📸", "Photography"], ["☕", "Café"],
    ["🎨", "Art & craft"], ["🐱", "Pets"], ["💄", "Skincare"], ["🎵", "Music"],
  ];
  const types = [
    "Paid campaigns", "Gifted collabs", "Recurring partnerships", "Product launches",
    "Event coverage", "Brand ambassadors", "Store openings", "UGC opportunities",
  ];

  return (
    <div className="v2-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <p className="v2-eyebrow-mono" style={{ textAlign: "center", display: "block", marginBottom: 22 }}>ONE MARKETPLACE · EVERY NICHE</p>
      <div className="v2-marquee-wrap">
        <div className="v2-marquee">
          {niches.map(([e, l], i) => (
            <span key={i} className="v2-chip"><span className="e">{e}</span>{l}</span>
          ))}
        </div>
      </div>
      <div className="v2-marquee-wrap" style={{ marginTop: 14 }}>
        <div className="v2-marquee">
          {types.map((l, i) => (
            <span key={i} className="v2-chip v2-chip-cyan">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Signal strip ─────────────────────────────────────────────────────────────

function Signals() {
  const signals = [
    { icon: <IconCheck size={16} />, title: "Clear briefs", text: "Compensation, deadline, deliverables, and brand fit are visible before anyone commits." },
    { icon: <IconUser size={16} />, title: "Micro-first", text: "Scout is built around creators with specific audiences, not inflated reach." },
    { icon: <IconMessages size={16} />, title: "Live threads", text: "Every match opens a campaign-specific conversation across web and mobile." },
    { icon: <IconGlobe size={16} />, title: "Local context", text: "City, niche, and availability stay part of the match instead of getting lost in DMs." },
  ];

  return (
    <div className="v2-container v2-reveal">
      <div className="v2-signals" aria-label="Scout product highlights">
        {signals.map((signal) => (
          <div className="v2-signal" key={signal.title}>
            <span className="v2-signal-ic">{signal.icon}</span>
            <div>
              <h2>{signal.title}</h2>
              <p>{signal.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Why Scout (bento) ────────────────────────────────────────────────────────

function WhyScout() {
  return (
    <section id="why" className="v2-section">
      <div className="v2-container">
        <div className="v2-section-head v2-reveal">
          <h2 className="v2-h2">WHY SCOUT?</h2>
          <p className="v2-sub">We help creators discover relevant opportunities and help businesses find creators who match their brand.</p>
        </div>

        <div className="v2-bento v2-reveal">
          <div className="v2-bento-card c3">
            <div className="v2-bento-ic"><IconUser size={18} /></div>
            <h3>Matched on fit</h3>
            <p>Creators and businesses are matched based on niche, location, audience, and goals, not just follower count.</p>
          </div>
          <div className="v2-bento-card c3">
            <div className="v2-bento-ic"><IconCheck size={18} /></div>
            <h3>Clarity from the start</h3>
            <p>Campaign details, deliverables, compensation, and timelines are visible up front.</p>
          </div>
          <div className="v2-bento-card c3">
            <div className="v2-bento-ic"><IconMessages size={18} /></div>
            <h3>One place for every conversation</h3>
            <p>Manage applications, messages, and collaborations in a single workspace.</p>
          </div>
          <div className="v2-bento-card c3">
            <div className="v2-bento-ic"><IconGlobe size={18} /></div>
            <h3>Built for local connections</h3>
            <p>Scout makes it easy for creators and businesses in the same community to discover and work with each other.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Showcase ─────────────────────────────────────────────────────────────────

type ShowcaseItem = {
  tag: string;
  h: string;
  body: string;
  bullets: string[];
  art: () => React.ReactNode;
  reverse: boolean;
};

const SHOWCASE: Record<Audience, ShowcaseItem[]> = {
  creator: [
    {
      tag: "01 — DISCOVER",
      h: "Discover opportunities tailored to you",
      body: "",
      bullets: ["Download the Scout app", "Build your creator profile", "Browse campaigns ranked by fit"],
      art: () => <MockupPhoneDiscover />,
      reverse: false,
    },
    {
      tag: "02 — COLLABORATE",
      h: "Collaborate with businesses that want to work with you",
      body: "",
      bullets: ["Show interest in a campaign", "Chat with interested businesses", "Agree on deliverables and timelines"],
      art: () => <MockupPhoneChat />,
      reverse: false,
    },
    {
      tag: "03 — GROW",
      h: "Build your reputation and grow your network",
      body: "",
      bullets: ["Track your earnings and active campaigns", "Showcase your completed collaborations on your portfolio", "Establish credibility with future collaborators and build long-lasting business partnerships"],
      art: () => <MockupPhoneProfile />,
      reverse: false,
    },
  ],
  business: [
    {
      tag: "01 — LAUNCH",
      h: "Launch a campaign on our website in minutes",
      body: "",
      bullets: ["Set the your goals, compensation type + details, and deliverables", "Outline the type of content and creator that fits your campaign", "Publish your campaign"],
      art: () => <WindowFrame title="scout.app/matches"><MockupMatches /></WindowFrame>,
      reverse: false,
    },
    {
      tag: "02 — CONNECT",
      h: "Connect with the right creators for your campaign",
      body: "",
      bullets: ["Browse interested creators ranked by fit", "Review and compare creator profiles, content, and past collaborations", "Message creators that fit your goals and brand"],
      art: () => <WindowFrame title="scout.app/campaigns/spring-drop"><MockupReview /></WindowFrame>,
      reverse: true,
    },
    {
      tag: "03 — TRACK",
      h: "Track and stay on top of every campaign",
      body: "",
      bullets: ["Track active campaigns and all creator applications", "Monitor progress, deliverables, and deadlines", "Ensure campaigns stay on track from start to finish", "Build long-lasting creator partnerships"],
      art: () => <WindowFrame title="scout.app/dashboard"><MockupDashboard /></WindowFrame>,
      reverse: false,
    },
  ],
};

function Showcase({ aud, setAud }: { aud: Audience; setAud: (a: Audience) => void }) {
  const items = SHOWCASE[aud];
  const isCreator = aud === "creator";
  const [step, setStep] = useState(0);

  useEffect(() => { setStep(0); }, [aud]);

  const it = items[step];

  return (
    <section id="showcase" className="v2-section" style={{ paddingTop: 56, scrollMarginTop: 48 }}>
      <div className="v2-container">
        <div className="v2-section-head v2-reveal">
          <h2 className="v2-h2">HOW IT WORKS</h2>
          <p className="v2-sub">
            {isCreator ? (
              <><strong>The creator app.</strong> Everything you need, in your pocket.</>
            ) : (
              <><strong>The business workspace.</strong> Everything you need, on the big screen.</>
            )}
          </p>
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <AudienceSwitch value={aud} onChange={setAud} />
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              style={{
                padding: "9px 22px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: step === i ? "rgba(124,58,237,0.7)" : "var(--color-divider)",
                background: step === i ? "rgba(124,58,237,0.18)" : "transparent",
                color: step === i ? "#ffffff" : "var(--color-text-muted)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "all 180ms ease",
              }}
            >
              {item.tag}
            </button>
          ))}
        </div>

        {/* Active step panel */}
        <div key={aud + "-" + step} className="v2-showcase" style={{ padding: "40px 0", animation: "showcase-in 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
          <div>
            <h2 className="v2-h2" style={{ fontSize: "clamp(24px,3vw,36px)" }}>{it.h}</h2>
            {it.body && <p className="v2-sub" style={{ marginLeft: 0 }}>{it.body}</p>}
            <ol style={{ margin: "20px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {it.bullets.map((b, j) => (
                <li key={j} style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(15px,1.5vw,19px)", lineHeight: 1.55, color: "var(--color-text-muted)" }}>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#7c3aed", flexShrink: 0 }}>{j + 1}.</span>
                  {b}
                </li>
              ))}
            </ol>
          </div>
          <div className="v2-showcase-art" style={{ display: "flex", justifyContent: "center" }}>
            {it.art()}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reveal on scroll ──────────────────────────────────────────────────────────

function useReveal(refreshKey: unknown) {
  useEffect(() => {
    document.documentElement.classList.add("v2-js");
    const els = document.querySelectorAll<HTMLElement>(".v2-reveal");
    const shouldRevealNow = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => {
      if (el.classList.contains("in") || shouldRevealNow(el)) {
        el.classList.add("in");
        return;
      }

      io.observe(el);
    });
    const t = setTimeout(() => els.forEach((el) => el.classList.add("in")), 2200);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [refreshKey]);
}

// ── Main component ────────────────────────────────────────────────────────────

function getInitialAudience(): Audience {
  if (typeof window === "undefined") return "creator";
  const cookieValue = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${audienceCookieName}=`))
    ?.split("=")[1];
  if (isAudience(cookieValue)) return cookieValue;

  const saved = localStorage.getItem("scout-audience");
  const storedAudience = saved ?? undefined;
  return isAudience(storedAudience) ? storedAudience : "creator";
}

export function LandingPageV2() {
  const router = useRouter();

  // Always start with SSR-safe defaults so server and client render the same HTML
  const [aud, setAud] = useState<Audience>("creator");
  const [theme, setTheme] = useState<Theme>("dark");

  // After mount, sync to stored audience and theme (client-only)
  useEffect(() => {
    const storedAud = getInitialAudience();
    setAud(storedAud);
    setTheme(getInitialTheme());
  }, []);

  // Persist audience to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("scout-audience", aud);
    document.cookie = getAudienceCookieValue(aud);
  }, [aud]);

  // Persist theme and apply to DOM when it changes
  useEffect(() => {
    localStorage.setItem("scout-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    setFavicon(theme);
  }, [theme]);

  // Mouse-follow spotlight
  useEffect(() => {
    function onMove(e: PointerEvent) {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useReveal(aud);

  function onJoinWaitlist(which: Audience) {
    localStorage.setItem("scout-audience", which);
    document.cookie = getAudienceCookieValue(which);
    router.push(`/waitlist?role=${which}`);
  }

  return (
    <>
      <BgStack />
      <div className="v2-spotlight" aria-hidden="true" />
      <div id="top" suppressHydrationWarning>
        <Nav aud={aud} theme={theme} setTheme={setTheme} onJoinWaitlist={onJoinWaitlist} />
        <Hero aud={aud} setAud={setAud} onJoinWaitlist={onJoinWaitlist} theme={theme} />
        <Marquee />
        <WhyScout />
        <Showcase aud={aud} setAud={setAud} />
        <Footer theme={theme} onJoinWaitlist={onJoinWaitlist} onShowHowItWorks={(which) => {
            setAud(which);
            const el = document.getElementById("showcase");
            if (!el) return;
            const nav = document.querySelector<HTMLElement>(".v2-nav");
            const navOffset = nav ? nav.getBoundingClientRect().height + 16 : 72;
            const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navOffset);
            window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
          }} />
      </div>
    </>
  );
}
