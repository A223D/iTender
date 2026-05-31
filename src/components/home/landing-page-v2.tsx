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
    h: ["Local brands that", "actually fit", "your feed."],
    sub: "Browse paid campaigns and gifted collabs built for micro-creators. Show interest in a tap, chat with brands, get paid — all from the Scout app.",
    primary: "Download the app",
    secondary: "See how it works",
    note: "Free for creators · iOS & Android",
  },
  business: {
    label: "Business",
    eyebrow: "FIND CREATORS THAT ACTUALLY CONVERT",
    h: ["Run every campaign,", "every creator,", "on one screen."],
    sub: "Launch a campaign, review applicants side-by-side, and message matched creators across every campaign — from a desktop workspace built for the work, not a phone app stretched to fit.",
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
    <section id="top" className="v2-container v2-hero">
      <span className="v2-eyebrow"><span className="dot" />{a.eyebrow}</span>

      <h1 className="v2-h1" style={{ maxWidth: "16ch" }}>
        {a.h[0]}<br />
        <span className="grad">{a.h[1]}</span> {a.h[2]}
      </h1>

      <p className="v2-sub">{a.sub}</p>

      <div style={{ marginTop: 34 }}>
        <AudienceSwitch value={aud} onChange={setAud} />
      </div>

      <div className="v2-hero-actions">
        <button
          type="button"
          className="v2-btn v2-btn-primary"
          onClick={() => onJoinWaitlist(aud)}
        >
          {a.primary}
        </button>
        <a href="#showcase" className="v2-btn v2-btn-ghost">{a.secondary}</a>
      </div>

      <div className="v2-hero-note">
        <span className="av-stack">
          <span className="av" /><span className="av" /><span className="av" /><span className="av" />
        </span>
        <span>{a.note}</span>
      </div>

      <div className="v2-stage">
        {aud === "business" ? (
          <div className="v2-stage-pane v2-stage-business" key="biz">
            <WindowFrame title="scout.app/matches — lumen & co."><MockupMatches /></WindowFrame>
          </div>
        ) : (
          <div className="v2-stage-pane v2-stage-creator" key="cre">
            <div><MockupPhoneProfile /></div>
            <div className="mid"><MockupPhoneDiscover /></div>
            <div><MockupPhoneChat /></div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Marquee ──────────────────────────────────────────────────────────────────

function Marquee() {
  const niches: [string, string][] = [
    ["🍕", "Food & drink"], ["💪", "Fitness"], ["👗", "Fashion"], ["✨", "Beauty"],
    ["🌿", "Wellness"], ["🏡", "Home"], ["📸", "Photography"], ["☕", "Café"],
    ["🎨", "Art & craft"], ["🐾", "Pets"], ["💄", "Skincare"], ["🎵", "Music"],
  ];
  const types: [string, boolean][] = [
    ["Paid campaigns", true], ["Gifted collabs", false], ["Local pop-ups", false],
    ["Product launches", true], ["UGC packages", false], ["Long-form video", false],
    ["Event coverage", false], ["Recurring partnerships", true],
  ];

  return (
    <div className="v2-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <p className="v2-eyebrow-mono" style={{ textAlign: "center", display: "block", marginBottom: 22 }}>ONE MARKETPLACE · EVERY NICHE</p>
      <div className="v2-marquee-wrap">
        <div className="v2-marquee">
          {[...niches, ...niches].map(([e, l], i) => (
            <span key={i} className="v2-chip"><span className="e">{e}</span>{l}</span>
          ))}
        </div>
      </div>
      <div className="v2-marquee-wrap" style={{ marginTop: 14 }}>
        <div className="v2-marquee rev">
          {[...types, ...types].map(([l, cy], i) => (
            <span key={i} className={"v2-chip " + (cy ? "v2-chip-cyan" : "")}>{l}</span>
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
          <span className="v2-eyebrow-mono">WHY SCOUT</span>
          <h2 className="v2-h2">Built so the right people actually find each other.</h2>
          <p className="v2-sub">No cold DMs, no scattered spreadsheets. Scout matches creators and businesses on niche, goals, and mutual fit — then gives each side the right tool for their half of the work.</p>
        </div>

        <div className="v2-bento v2-reveal">
          <div className="v2-bento-card c4">
            <div className="v2-bento-glow" />
            <div className="v2-bento-ic"><IconUser size={18} /></div>
            <h3>Matched on fit, not follower count</h3>
            <p>Creators surface for campaigns that match their niche, location, and audience — and businesses see why each applicant fits before they ever open a thread. Smaller, truer audiences beat vanity reach.</p>
          </div>
          <div className="v2-bento-card c2">
            <div className="v2-bento-ic"><IconCheck size={18} /></div>
            <h3>Clear from the start</h3>
            <p>Deliverables, compensation, and timelines are visible up front. No guessing.</p>
          </div>
          <div className="v2-bento-card c3">
            <div className="v2-bento-ic"><IconMessages size={18} /></div>
            <h3>One place for every conversation</h3>
            <p>Replace cold email and DM chaos with threaded conversations grouped by campaign — synced live across web and mobile.</p>
          </div>
          <div className="v2-bento-card c3">
            <div className="v2-bento-glow" />
            <div className="v2-bento-ic"><IconGlobe size={18} /></div>
            <h3>Local-first by design</h3>
            <p>Scout is built for the corner café and the city-wide brand alike — collaborations that happen where you actually are.</p>
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
      h: "Campaigns built for your niche, ready to browse.",
      body: "Scout surfaces paid and gifted collabs that fit your focus and your city. Tap to show interest in the ones you want — the brand sees it instantly.",
      bullets: ["Paid, gifted, and hybrid offers — filtered to your niche", "See compensation and deliverables before you show interest", "Local opportunities, ranked by fit"],
      art: () => <MockupPhoneDiscover />,
      reverse: false,
    },
    {
      tag: "02 — COLLABORATE",
      h: "Chat with brands like a normal human.",
      body: "Once you match, every campaign gets its own thread. Talk through the brief, lock dates, and ship — in the same messaging patterns you already use all day.",
      bullets: ["One thread per campaign, never lose the context", "Brand brief pinned right above the conversation", "Real-time — no refresh, no waiting"],
      art: () => <MockupPhoneChat />,
      reverse: true,
    },
    {
      tag: "03 — GROW",
      h: "Watch the deals — and the earnings — add up.",
      body: "Your profile tracks active campaigns, brand deals, and what you've earned. Build a track record that brings the next collab to you.",
      bullets: ["Earnings and active deals at a glance", "A portfolio brands can actually browse", "Repeat partnerships, not one-off gigs"],
      art: () => <MockupPhoneProfile />,
      reverse: false,
    },
  ],
  business: [
    {
      tag: "01 — MULTI-CREATOR CHAT",
      h: "Twelve creators, three campaigns, one window.",
      body: "A Slack-style three-pane layout: campaigns on the left, threads in the middle, the active conversation on the right. Switch with j/k, send with ↵. No more drilling.",
      bullets: ["Independent scroll in each pane — no accidental jumps", "Per-campaign unread counts that survive a refresh", "Inline campaign brief above every thread"],
      art: () => <WindowFrame title="scout.app/matches"><MockupMatches /></WindowFrame>,
      reverse: false,
    },
    {
      tag: "02 — APPLICANT REVIEW",
      h: "Compare twenty creators in twenty minutes.",
      body: "Applicants left, full detail right — pitch, platforms, portfolio, brand history. Multi-select with shift-click for bulk accept, reject, or message-from-template.",
      bullets: ["Sort by followers, recency, or audience fit", "Keyboard-driven: a accept · r pass · m message", "Every action is undoable for 5 seconds"],
      art: () => <WindowFrame title="scout.app/campaigns/spring-drop"><MockupReview /></WindowFrame>,
      reverse: true,
    },
    {
      tag: "03 — DASHBOARD",
      h: "Every campaign, every metric, one glance.",
      body: "Live KPIs, dense campaign cards with applicant previews and days-left chips, plus an activity rail that batches what changed since this morning.",
      bullets: ["Responsive grid — up to four columns of campaigns", "Stale-campaign nudges after 7 quiet days", "Click any activity row to jump into the thread"],
      art: () => <WindowFrame title="scout.app/dashboard"><MockupDashboard /></WindowFrame>,
      reverse: false,
    },
  ],
};

function Showcase({ aud, setAud }: { aud: Audience; setAud: (a: Audience) => void }) {
  const items = SHOWCASE[aud];
  const isCreator = aud === "creator";
  return (
    <section id="showcase" className="v2-section" style={{ paddingTop: 56 }}>
      <div className="v2-container">
        <div className="v2-section-head v2-reveal">
          <span className="v2-eyebrow-mono">{isCreator ? "THE CREATOR APP" : "THE BUSINESS WORKSPACE"}</span>
          <h2 className="v2-h2">{isCreator ? "Everything you need, in your pocket." : "Everything you need, on the big screen."}</h2>
          <p className="v2-sub">{isCreator
            ? "Creators work from the Scout mobile app — discovery, applications, and chat, built for the moments you're actually thinking about content."
            : "Businesses work from the Scout web app — dense, parallel, keyboard-driven. The interface you've wished every creator tool had."
          }</p>
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <AudienceSwitch value={aud} onChange={setAud} />
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {items.map((it, i) => (
            <div key={aud + i} className={"v2-showcase v2-reveal" + (it.reverse ? " rev" : "")} style={{ padding: "40px 0" }}>
              <div>
                <span className="v2-step-tag">{it.tag}</span>
                <h2 className="v2-h2" style={{ fontSize: "clamp(24px,3vw,36px)" }}>{it.h}</h2>
                <p className="v2-sub" style={{ marginLeft: 0 }}>{it.body}</p>
                <ul className="v2-feature-list">
                  {it.bullets.map((b, j) => (
                    <li key={j}><span className="b"><CheckIcon /></span>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="v2-showcase-art" style={{ display: "flex", justifyContent: "center" }}>
                {it.art()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────

function HowItWorks({ aud }: { aud: Audience }) {
  const steps = aud === "creator"
    ? [
        { h: "Build your profile", p: "Import your socials, set your niche and city. Takes about two minutes in the app." },
        { h: "Show interest in campaigns", p: "Browse local paid and gifted offers that match your vibe. One tap to let the brand know you're in." },
        { h: "Collaborate & get paid", p: "Match, agree the brief in chat, create the content, and get paid through Scout." },
      ]
    : [
        { h: "Brief in three steps", p: "Goals, compensation, deliverables, deadline. A live preview shows what creators will see." },
        { h: "Review applicants side-by-side", p: "Compare pitch, platforms, and fit. Multi-select for bulk actions or accept one at a time." },
        { h: "Launch & grow", p: "Every matched creator gets a thread grouped by campaign. Ship, measure, repeat." },
      ];

  return (
    <section id="how" className="v2-section" style={{ paddingTop: 56 }}>
      <div className="v2-container">
        <div className="v2-section-head v2-reveal">
          <span className="v2-eyebrow-mono">HOW IT WORKS</span>
          <h2 className="v2-h2">{aud === "creator" ? "From download to first deal in a day." : "From signup to first match in an afternoon."}</h2>
        </div>
        <div className="v2-steps v2-reveal">
          {steps.map((s, i) => (
            <div key={i} className="v2-step">
              <h3 className="v2-h3">{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ── Two-door CTA ──────────────────────────────────────────────────────────────

function CTA({ onJoinWaitlist }: { onJoinWaitlist: (w: Audience) => void }) {
  return (
    <section className="v2-section" style={{ paddingTop: 32, paddingBottom: 96 }}>
      <div className="v2-container">
        <div className="v2-cta v2-reveal">
          <span className="v2-eyebrow" style={{ position: "relative" }}><span className="dot" />PICK YOUR DOOR</span>
          <h2 className="v2-h2" style={{ position: "relative", maxWidth: "18ch", margin: "0 auto" }}>Two sides, one marketplace. Where do you come in?</h2>
          <div className="v2-doors">
            <button type="button" className="v2-door" onClick={() => onJoinWaitlist("creator")}>
              <div className="v2-door-ic"><IconStar size={20} /></div>
              <h3>I&apos;m a creator</h3>
              <p>Get the Scout app, build your profile, and start applying to local campaigns that fit your niche.</p>
              <span className="go">Download the app <span className="arr">→</span></span>
            </button>
            <button type="button" className="v2-door" onClick={() => onJoinWaitlist("business")}>
              <div className="v2-door-ic"><IconCampaigns size={20} /></div>
              <h3>I&apos;m a business</h3>
              <p>Open the web workspace, post your first campaign, and review creator applicants the same day.</p>
              <span className="go">Start a campaign <span className="arr">→</span></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

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
            <span className="v2-eyebrow"><span className="dot" />JOIN THE WAITLIST</span>
            <h2 className="v2-h2">Get early access to Scout.</h2>
            <p className="v2-sub">
              Tell us who you are and where to reach you. We&apos;ll use this to invite the right creators and brands as Scout opens up.
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
                  <small>Apply for local campaigns.</small>
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
                  <small>Find creator partners.</small>
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
            <p>The local marketplace where small brands and micro-creators actually find each other.</p>
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
  // Lazy initializers read from localStorage/DOM on client, use safe defaults for SSR
  const [aud, setAud] = useState<Audience>(getInitialAudience);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [waitlistRole, setWaitlistRole] = useState<WaitlistRole>(getWaitlistRole(aud));
  const [waitlistScrollRequest, setWaitlistScrollRequest] = useState(0);

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
        <Signals />
        <WhyScout />
        <Showcase aud={aud} setAud={setAud} />
        <HowItWorks aud={aud} />
        <WaitlistSection selectedRole={waitlistRole} onRoleChange={setWaitlistRole} />
        <CTA onJoinWaitlist={onJoinWaitlist} />
        <Footer theme={theme} onJoinWaitlist={onJoinWaitlist} />
      </div>
    </>
  );
}
