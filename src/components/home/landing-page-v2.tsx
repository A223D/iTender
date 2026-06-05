"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

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

type Theme = "dark" | "light";
type WaitlistRole = "creator" | "brand";

type WaitlistFormState = {
  name: string;
  email: string;
  phone: string;
  instagramHandle: string;
  companyName: string;
  websiteUrl: string;
};

const initialWaitlistForm: WaitlistFormState = {
  name: "",
  email: "",
  phone: "",
  instagramHandle: "",
  companyName: "",
  websiteUrl: "",
};

function validateWaitlistForm(form: WaitlistFormState, role: WaitlistRole) {
  if (!form.name.trim()) return "Enter your name.";
  if (!form.email.trim() && !form.phone.trim()) return "Enter an email or phone number.";
  if (role === "creator" && !form.instagramHandle.trim()) return "Enter your Instagram handle.";
  if (role === "brand" && !form.companyName.trim()) return "Enter your company name.";
  return "";
}

function getWaitlistRole(audience: Audience): WaitlistRole {
  return audience === "business" ? "brand" : "creator";
}

const WAITLIST_ANCHOR_ID = "waitlist";
const WAITLIST_FORM_ID = "waitlist-form";

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

function IconSun() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="scout-focus"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 8px",
        borderRadius: 999,
        border: "1px solid var(--color-divider)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--color-text-muted)",
        transition: "border-color 160ms ease",
      }}
    >
      {/* sun icon */}
      <span style={{ color: !isDark ? "var(--color-text)" : "var(--color-text-hint)", transition: "color 200ms ease", display: "inline-flex" }}>
        <IconSun />
      </span>
      {/* knob track */}
      <span style={{
        position: "relative",
        width: 30,
        height: 16,
        borderRadius: 999,
        background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
        border: "1px solid var(--color-divider)",
        display: "inline-block",
        transition: "background 200ms ease",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute",
          top: 2,
          left: isDark ? 14 : 2,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isDark ? "#FFFFFF" : "#0F172A",
          transition: "left 200ms cubic-bezier(0.22,1,0.36,1), background 200ms ease",
        }} />
      </span>
      {/* moon icon */}
      <span style={{ color: isDark ? "var(--color-text)" : "var(--color-text-hint)", transition: "color 200ms ease", display: "inline-flex" }}>
        <IconMoon />
      </span>
    </button>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ScoutMark({ theme, size }: { theme: Theme; size: number }) {
  return (
    <Image
      src={theme === "dark" ? "/logo-mark-white.png" : "/logo-mark.png"}
      width={size}
      height={size}
      alt="Scout"
      style={{ borderRadius: "50%" }}
    />
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

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav({
  aud, theme, setTheme, onJoinWaitlist,
}: {
  aud: Audience;
  theme: Theme; setTheme: (t: Theme) => void;
  onJoinWaitlist: (which: Audience) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="v2-nav">
        <a href="#top" className="scout-focus" onClick={close} style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)", flexShrink: 0 }}>
          <ScoutMark theme={theme} size={28} />
          <span style={{ fontWeight: 900, letterSpacing: "-0.01em", fontSize: 17 }}>Scout</span>
        </a>
        <nav className="v2-nav-links">
          <a href="#why" className="v2-nav-link">Why Scout</a>
          <a href="#showcase" className="v2-nav-link">Product</a>
          <a href="#how" className="v2-nav-link">How it works</a>
          <a href="#waitlist" className="v2-nav-link">Waitlist</a>
        </nav>
        <div className="v2-nav-actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm v2-nav-login" onClick={() => onJoinWaitlist("business")}>Business login</button>
          <button type="button" className="v2-btn v2-btn-primary v2-btn-sm v2-nav-cta-desktop" onClick={() => onJoinWaitlist(aud)}>Get started</button>
          <button
            type="button"
            className="v2-nav-hamburger scout-focus"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>
      {menuOpen && (
        <div className="v2-mobile-menu" role="dialog" aria-label="Navigation menu">
          <nav style={{ display: "flex", flexDirection: "column" }}>
            <a href="#why" className="v2-mobile-menu-link" onClick={close}>Why Scout</a>
            <a href="#showcase" className="v2-mobile-menu-link" onClick={close}>Product</a>
            <a href="#how" className="v2-mobile-menu-link" onClick={close}>How it works</a>
            <a href="#waitlist" className="v2-mobile-menu-link" onClick={close}>Waitlist</a>
          </nav>
          <div className="v2-mobile-menu-actions">
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" style={{ width: "100%" }} onClick={() => { onJoinWaitlist("business"); close(); }}>
              Business login
            </button>
            <button type="button" className="v2-btn v2-btn-primary v2-btn-sm" style={{ width: "100%" }} onClick={() => { onJoinWaitlist(aud); close(); }}>
              Get started
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ aud, setAud, onJoinWaitlist }: { aud: Audience; setAud: (a: Audience) => void; onJoinWaitlist: (w: Audience) => void }) {
  const a = AUD[aud];

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
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
        {/* Dark overlay on left for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(10,4,24,0.92) 0%, rgba(10,4,24,0.75) 45%, rgba(10,4,24,0.0) 70%)",
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
              style={aud === "creator" ? { background: "#7c3aed", border: "none", padding: "12px 28px", fontSize: 15 } : { padding: "12px 28px", fontSize: 15 }}>
              <IconStar size={15} /> I&apos;m a Creator
            </button>
            <button type="button"
              className={"v2-btn " + (aud === "business" ? "v2-btn-primary" : "v2-btn-ghost")}
              onClick={() => setAud("business")}
              style={aud === "business" ? { background: "#7c3aed", border: "none", padding: "12px 28px", fontSize: 15 } : { padding: "12px 28px", fontSize: 15 }}>
              <IconCampaigns size={15} /> I&apos;m a Business
            </button>
          </div>

          <a
            href={aud === "creator" ? "#" : "/login"}
            style={{ background: "#ffffff", color: "#1a0533", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", marginBottom: 8, textDecoration: "none" }}>
            {aud === "creator"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
              : <IconCampaigns size={16} />}
            {a.primary}
          </a>
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
    <section id="showcase" className="v2-section" style={{ paddingTop: 56 }}>
      <div className="v2-container">
        <div className="v2-section-head v2-reveal">
          <h2 className="v2-h2">{isCreator ? "THE CREATOR APP" : "THE BUSINESS WORKSPACE"}</h2>
          <p className="v2-sub">{isCreator ? "Everything you need, in your pocket." : "Everything you need, on the big screen."}</p>
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

// ── How it works ─────────────────────────────────────────────────────────────



// Waitlist

function WaitlistSection({
  selectedRole, onRoleChange,
}: {
  selectedRole: WaitlistRole;
  onRoleChange: (role: WaitlistRole) => void;
}) {
  const [form, setForm] = useState<WaitlistFormState>(initialWaitlistForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateField<K extends keyof WaitlistFormState>(key: K, value: WaitlistFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateWaitlistForm(form, selectedRole);
    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      return;
    }

    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: selectedRole }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(typeof result?.error === "string" ? result.error : "Could not join the waitlist right now.");
      return;
    }

    setStatus("success");
    setMessage("You're on the waitlist. We'll be in touch soon.");
    setForm(initialWaitlistForm);
  }

  const isCreator = selectedRole === "creator";
  const isSubmitting = status === "submitting";

  return (
    <section className="v2-section" style={{ paddingTop: 44, paddingBottom: 32 }}>
      <div className="v2-container">
        <div id={WAITLIST_ANCHOR_ID} className="v2-waitlist v2-reveal">
          <div className="v2-waitlist-copy">
            <h2 className="v2-h2" style={{ color: "var(--accent)" }}>Join the Waitlist</h2>
            <p className="v2-sub">
              Be among the first to try Scout. Tell us a bit about yourself so we can bring the right creators and businesses onto the platform as we grow.
            </p>
          </div>

          <form id={WAITLIST_FORM_ID} className="v2-waitlist-form" onSubmit={onSubmit} noValidate>
            <div className="v2-field">
              <label htmlFor="waitlist-name">Name</label>
              <input
                id="waitlist-name"
                name="name"
                className="input-recessed"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="v2-field-row">
              <div className="v2-field">
                <label htmlFor="waitlist-email">Email</label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  className="input-recessed"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="v2-field">
                <label htmlFor="waitlist-phone">Phone</label>
                <input
                  id="waitlist-phone"
                  name="phone"
                  type="tel"
                  className="input-recessed"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  autoComplete="tel"
                  placeholder="Optional if email is added"
                />
              </div>
            </div>

            <fieldset className="v2-role-field">
              <legend>I am a</legend>
              <div className="v2-role-grid">
                <label className={`v2-role-card ${isCreator ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="creator"
                    checked={isCreator}
                    onChange={() => onRoleChange("creator")}
                  />
                  <span>Creator</span>
                </label>
                <label className={`v2-role-card ${!isCreator ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="brand"
                    checked={!isCreator}
                    onChange={() => onRoleChange("brand")}
                  />
                  <span>Brand</span>
                </label>
              </div>
            </fieldset>

            {isCreator ? (
              <div className="v2-field">
                <label htmlFor="waitlist-instagram">Instagram handle</label>
                <input
                  id="waitlist-instagram"
                  name="instagramHandle"
                  className="input-recessed"
                  value={form.instagramHandle}
                  onChange={(event) => updateField("instagramHandle", event.target.value)}
                  autoComplete="off"
                  placeholder="@yourhandle"
                  required
                />
              </div>
            ) : (
              <div className="v2-field-row">
                <div className="v2-field">
                  <label htmlFor="waitlist-company">Company name</label>
                  <input
                    id="waitlist-company"
                    name="companyName"
                    className="input-recessed"
                    value={form.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    autoComplete="organization"
                    required
                  />
                </div>
                <div className="v2-field">
                  <label htmlFor="waitlist-website">Website <span>optional</span></label>
                  <input
                    id="waitlist-website"
                    name="websiteUrl"
                    type="url"
                    className="input-recessed"
                    value={form.websiteUrl}
                    onChange={(event) => updateField("websiteUrl", event.target.value)}
                    autoComplete="url"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}

            <div className="v2-waitlist-actions">
              <button type="submit" className="v2-btn v2-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join the waitlist"}
              </button>
              <p className="v2-field-hint">Email or phone is required. We will only use it for Scout launch updates.</p>
            </div>

            {message ? (
              <p className={`v2-form-message ${status === "success" ? "success" : "error"}`} role={status === "error" ? "alert" : "status"}>
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

// Footer

function Footer({
  theme, onJoinWaitlist,
}: {
  theme: Theme;
  onJoinWaitlist: (w: Audience) => void;
}) {
  return (
    <footer className="v2-footer">
      <div className="v2-container">
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)" }}>
              <ScoutMark theme={theme} size={26} />
              <span style={{ fontWeight: 900, fontSize: 16 }}>Scout</span>
            </a>
            <p>The link between creators and businesses.</p>
          </div>
          <div>
            <h4>Creators</h4>
            <ul>
              <li><button type="button" onClick={() => onJoinWaitlist("creator")}>Download the app</button></li>
              <li><a href="#how">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4>Businesses</h4>
            <ul>
              <li><button type="button" onClick={() => onJoinWaitlist("business")}>Start a campaign</button></li>
              <li><button type="button" onClick={() => onJoinWaitlist("business")}>Business login</button></li>
              <li><a href="#showcase">The workspace</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Help</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="v2-footer-base">
          <span>© 2026 Scout · micro-influencer collaborations, locally</span>
          <span>made for creators &amp; the brands who get them</span>
        </div>
      </div>
    </footer>
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

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  // Use the class already set by the layout inline script (which checks localStorage + OS)
  if (document.documentElement.classList.contains("light")) return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  // Fallback to OS preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setFavicon(theme: Theme) {
  const href = theme === "dark" ? "/logo-mark-white.png" : "/logo-mark.png";
  const linkId = "scout-theme-favicon";
  let link = document.querySelector<HTMLLinkElement>(`link#${linkId}`);

  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }

  link.href = href;
}

export function LandingPageV2() {
  // Always start with SSR-safe defaults so server and client render the same HTML
  const [aud, setAud] = useState<Audience>("creator");
  const [theme, setTheme] = useState<Theme>("dark");
  const [waitlistRole, setWaitlistRole] = useState<WaitlistRole>(getWaitlistRole("creator"));
  const [waitlistScrollRequest, setWaitlistScrollRequest] = useState(0);

  // After mount, sync to stored audience and theme (client-only)
  useEffect(() => {
    const storedAud = getInitialAudience();
    setAud(storedAud);
    setWaitlistRole(getWaitlistRole(storedAud));
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

  useEffect(() => {
    if (!waitlistScrollRequest) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const waitlistForm = document.getElementById(WAITLIST_FORM_ID);
        if (!waitlistForm) return;

        const nav = document.querySelector<HTMLElement>(".v2-nav");
        const navOffset = nav ? nav.getBoundingClientRect().height + 16 : 72;
        const top = Math.max(0, waitlistForm.getBoundingClientRect().top + window.scrollY - navOffset);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [waitlistScrollRequest]);

  function onJoinWaitlist(which: Audience) {
    setAud(which);
    setWaitlistRole(getWaitlistRole(which));
    setWaitlistScrollRequest((request) => request + 1);
    localStorage.setItem("scout-audience", which);
    document.cookie = getAudienceCookieValue(which);
    window.history.replaceState(null, "", `#${WAITLIST_ANCHOR_ID}`);
  }

  return (
    <>
      <BgStack />
      <div className="v2-spotlight" aria-hidden="true" />
      <div id="top" suppressHydrationWarning>
        <Nav aud={aud} theme={theme} setTheme={setTheme} onJoinWaitlist={onJoinWaitlist} />
        <Hero aud={aud} setAud={setAud} onJoinWaitlist={onJoinWaitlist} />
        <Marquee />
        <WhyScout />
        <Showcase aud={aud} setAud={setAud} />
        <WaitlistSection selectedRole={waitlistRole} onRoleChange={setWaitlistRole} />
        <Footer theme={theme} onJoinWaitlist={onJoinWaitlist} />
      </div>
    </>
  );
}
