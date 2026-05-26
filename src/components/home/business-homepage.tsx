import Link from "next/link";

import { HomeAudienceLink } from "@/components/home/home-audience-link";
import {
  MockupBrowser,
  MockupDashboard,
  MockupMatches,
  MockupPhone,
  MockupReview,
  WindowFrame,
} from "@/components/home/landing-mockups";

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function BusinessHomePage() {
  return (
    <div className="landing-shell">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section id="top" className="l-container l-hero">
        <div>
          <span className="l-section-eyebrow">
            <span className="dot" />
            SCOUT FOR BUSINESS · DESKTOP
          </span>
          <h1 className="l-h1">
            Run every campaign, every conversation,{" "}
            <span className="accent">on one screen.</span>
          </h1>
          <p className="l-sub" style={{ marginTop: 24 }}>
            Scout for business is built for the work you actually do on desktop —
            comparing creators, threading conversations across campaigns, and moving
            twenty applicants forward in an afternoon.{" "}
            <em style={{ color: "var(--color-text)", fontStyle: "normal" }}>
              Not a mobile app stretched to fit.
            </em>
          </p>
          <div className="l-hero-actions">
            <Link
              href="/login?audience=business"
              className="rounded-full bg-[var(--color-text)] px-7 py-3.5 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
            >
              Start your first campaign
            </Link>
            <a
              href="#features"
              className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] active:scale-95"
            >
              See it in action
            </a>
          </div>
          <div className="l-hero-trust">
            <div className="avs">
              <div className="av" /><div className="av" /><div className="av" /><div className="av" />
            </div>
            <span>Free while you launch your first campaign · no card required</span>
          </div>
        </div>

        <div>
          <WindowFrame title="scout.app/matches — lumen & co.">
            <MockupMatches />
          </WindowFrame>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <div className="l-container">
        <div className="l-stats">
          {[
            { num: "3-pane", label: "Campaigns, threads, conversation — never lose context", cyan: false },
            { num: "⌘K", label: "Jump anywhere · keyboard navigation throughout", cyan: false },
            { num: "20×", label: "Multi-select bulk actions on applicant lists", cyan: true },
            { num: "live", label: "Real-time message + application updates", cyan: false },
          ].map((s) => (
            <div key={s.num}>
              <p className={`l-stat-num${s.cyan ? " cyan" : ""}`}>{s.num}</p>
              <p className="l-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="l-section">
        <div className="l-container" style={{ marginBottom: 8 }}>
          <span className="l-eyebrow-mono">THE DESKTOP WINS</span>
          <h2 className="l-h2">Three things you can&apos;t do on a phone.</h2>
          <p className="l-sub" style={{ marginTop: 16 }}>
            The desktop app exists because three specific jobs fall apart on mobile:
            parallel chat, side-by-side applicant review, and a real campaign overview.
            Here&apos;s how Scout handles each.
          </p>
        </div>

        <div className="l-container">
          {/* Feature 1 — Multi-creator chat */}
          <section className="l-feature">
            <div className="l-feature-copy">
              <span className="l-feature-num">01 — MULTI-CREATOR CHAT</span>
              <h2 className="l-h2">Twelve creators, three campaigns, one window.</h2>
              <p className="l-feature-body">
                A Slack-style three-pane layout: campaigns on the left, threads in the middle,
                the active conversation on the right. Switch context with{" "}
                <kbd className="kbd">j</kbd>/<kbd className="kbd">k</kbd>,
                archive with <kbd className="kbd">e</kbd>, send with <kbd className="kbd">↵</kbd>.
                No more drilling.
              </p>
              <ul className="l-feature-bullets">
                <li><span className="b-icon"><CheckIcon /></span>Independent scroll in each pane — no accidental jumps</li>
                <li><span className="b-icon"><CheckIcon /></span>Per-campaign unread counts, with badges that survive a refresh</li>
                <li><span className="b-icon"><CheckIcon /></span>Inline campaign brief above every thread — context, always</li>
              </ul>
            </div>
            <div className="l-feature-art">
              <WindowFrame title="scout.app/matches"><MockupMatches /></WindowFrame>
            </div>
          </section>

          {/* Feature 2 — Applicant review */}
          <section className="l-feature reverse">
            <div className="l-feature-copy">
              <span className="l-feature-num">02 — APPLICANT REVIEW</span>
              <h2 className="l-h2">Compare twenty creators in twenty minutes.</h2>
              <p className="l-feature-body">
                Applicants left, full detail right — pitch, platforms, portfolio, brand history.
                Multi-select with <kbd className="kbd">shift</kbd>-click for bulk accept, reject,
                or message-from-template. Saved views remember the filters you actually use.
              </p>
              <ul className="l-feature-bullets">
                <li><span className="b-icon"><CheckIcon /></span>Sort by followers, recency, or audience fit · filter by platform, niche, status</li>
                <li><span className="b-icon"><CheckIcon /></span><kbd className="kbd">a</kbd> accept · <kbd className="kbd">r</kbd> pass · <kbd className="kbd">m</kbd> message — keyboard-driven flow</li>
                <li><span className="b-icon"><CheckIcon /></span>Every action is undoable for 5 seconds, in case you were wrong</li>
              </ul>
            </div>
            <div className="l-feature-art">
              <WindowFrame title="scout.app/campaigns/spring-drop"><MockupReview /></WindowFrame>
            </div>
          </section>

          {/* Feature 3 — Dashboard */}
          <section className="l-feature">
            <div className="l-feature-copy">
              <span className="l-feature-num">03 — DASHBOARD</span>
              <h2 className="l-h2">Every campaign, every metric, one glance.</h2>
              <p className="l-feature-body">
                Live KPIs, dense campaign cards with applicant previews and days-left chips,
                plus an activity rail at{" "}
                <code style={{ fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", color: "#67E8F9", background: "rgba(103,232,249,0.10)", padding: "1px 5px", borderRadius: 3, fontSize: 13 }}>xl+</code>{" "}
                screens that batches new applicants and messages so you know what changed
                since this morning.
              </p>
              <ul className="l-feature-bullets">
                <li><span className="b-icon"><CheckIcon /></span>Responsive grid — 1 → 2 → 3 → 4 columns up to 2xl</li>
                <li><span className="b-icon"><CheckIcon /></span>Stale-campaign nudges when a campaign goes 7 days with no interest</li>
                <li><span className="b-icon"><CheckIcon /></span>Click any activity row to deep-link straight into the thread</li>
              </ul>
            </div>
            <div className="l-feature-art">
              <WindowFrame title="scout.app/dashboard"><MockupDashboard /></WindowFrame>
            </div>
          </section>
        </div>
      </section>

      {/* ── POWER USER ────────────────────────────────────────────── */}
      <section id="power" className="l-section" style={{ paddingTop: 40 }}>
        <div className="l-container">
          <div style={{ maxWidth: 640 }}>
            <span className="l-eyebrow-mono">POWER USER</span>
            <h2 className="l-h2">Built for the people who live inside it.</h2>
            <p className="l-sub" style={{ marginTop: 16 }}>
              Every interaction has a keyboard equivalent. Lists are{" "}
              <kbd className="kbd">j</kbd>/<kbd className="kbd">k</kbd>,
              modals are <kbd className="kbd">esc</kbd>, routes are{" "}
              <kbd className="kbd">g</kbd> + leader.
              Save your filter combinations as named views.
            </p>
          </div>
          <div className="l-power" style={{ marginTop: 36 }}>
            {[
              { keys: [["⌘", "K"]], title: "Command palette", desc: "Jump to any campaign, thread, or action from one shortcut." },
              { keys: [["j"], ["k"]], title: "List navigation", desc: "Vim-style up and down through threads and applicants." },
              { keys: [["shift"], ["click"]], title: "Range select", desc: "Bulk accept, reject, or template-message many creators at once." },
              { keys: [["?"]], title: "Shortcuts overlay", desc: "A cheat sheet that lives one keystroke away. Always." },
            ].map((tile) => (
              <div key={tile.title} className="l-power-card">
                <div className="l-power-keys">
                  {tile.keys.flatMap((row, j) =>
                    row.map((k) => (
                      <kbd key={`${j}-${k}`} className="kbd" style={{ fontSize: 12, height: 22, padding: "0 8px" }}>{k}</kbd>
                    ))
                  )}
                </div>
                <p><strong>{tile.title}</strong><br />{tile.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEB + MOBILE ──────────────────────────────────────────── */}
      <section id="split" className="l-section" style={{ paddingTop: 40 }}>
        <div className="l-container">
          <div style={{ maxWidth: 640 }}>
            <span className="l-eyebrow-mono">WEB + MOBILE</span>
            <h2 className="l-h2">Where each side works best.</h2>
            <p className="l-sub" style={{ marginTop: 16 }}>
              Businesses run campaigns on desktop, where the work is dense and parallel.
              Creators discover, apply, and chat from the Scout mobile app — built for
              the times and places they&apos;re actually thinking about content.
            </p>
          </div>
          <div className="l-split" style={{ marginTop: 36 }}>
            <div className="l-split-card">
              <span className="l-eyebrow-mono">FOR BUSINESSES</span>
              <h3 className="l-h3" style={{ marginTop: 6 }}>scout.app on desktop</h3>
              <p className="l-split-card-body">
                Multi-pane comms, applicant review with bulk actions, command palette,
                keyboard nav, saved views, live activity rail. The interface you&apos;ve wished
                every creator tool had.
              </p>
              <div className="l-split-art"><MockupBrowser /></div>
            </div>
            <div className="l-split-card">
              <span className="l-eyebrow-mono">FOR CREATORS</span>
              <h3 className="l-h3" style={{ marginTop: 6 }}>Scout app on iOS &amp; Android</h3>
              <p className="l-split-card-body">
                Swipe through campaigns that fit your niche. Apply with one tap. Chat with
                brands in the same patterns you already use for everything else. No web login required.
              </p>
              <div className="l-split-art"><MockupPhone /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="l-section" style={{ paddingTop: 40 }}>
        <div className="l-container">
          <div style={{ maxWidth: 640 }}>
            <span className="l-eyebrow-mono">HOW IT WORKS</span>
            <h2 className="l-h2">From signup to first match in an afternoon.</h2>
          </div>
          <div className="l-steps">
            <div className="l-step">
              <span className="l-step-num">01 / CAMPAIGN</span>
              <h3 className="l-h3">Brief in three steps</h3>
              <p>Goals, compensation, deliverables, deadline. A live preview shows what creators will see. Drafts auto-save.</p>
            </div>
            <div className="l-step">
              <span className="l-step-num">02 / REVIEW</span>
              <h3 className="l-h3">Compare applicants side-by-side</h3>
              <p>Pitch, platforms, portfolio, brand history. Multi-select for bulk actions or hit <kbd className="kbd">a</kbd> to accept one at a time.</p>
            </div>
            <div className="l-step">
              <span className="l-step-num">03 / LAUNCH</span>
              <h3 className="l-h3">Chat, ship, repeat</h3>
              <p>Every matched creator gets their own thread, grouped by campaign. Sent messages and applicant updates land live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ─────────────────────────────────────────────────── */}
      <section className="l-section" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="l-container">
          <p className="l-eyebrow-mono" style={{ textAlign: "center", display: "block", marginBottom: 0 }}>
            EARLY BRANDS RUNNING SCOUT
          </p>
          <div className="l-logos">
            {["lumen & co.", "aurell botanicals", "quill café", "north field press", "tonebox studio", "plain field"].map((b) => (
              <div key={b} className="l-logo">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="l-section" style={{ paddingTop: 0, paddingBottom: 96 }}>
        <div className="l-container">
          <div className="l-cta">
            <h2 className="l-h2" style={{ margin: 0 }}>Your first campaign in 90 seconds.</h2>
            <p className="l-cta-sub">
              Sign in with Google or email. We&apos;ll create your business account, walk you through
              your first brief, and have you reviewing applicants the same day.
            </p>
            <div className="l-cta-actions">
              <Link
                href="/login?audience=business"
                className="rounded-full bg-[var(--color-text)] px-7 py-3.5 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-95"
              >
                Sign in / get started
              </Link>
              <a
                href="mailto:hello@scout.app"
                className="glass rounded-full px-7 py-3.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] active:scale-95"
              >
                Talk to us first
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <div className="l-container">
        <footer className="l-footer">
          <div>
            <span style={{ fontWeight: 700, fontStyle: "italic", color: "var(--color-text)", letterSpacing: "-0.01em", marginRight: 16 }}>Scout</span>
            <span>© 2026 · for the small businesses that take creators seriously</span>
          </div>
          <nav style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            <HomeAudienceLink
              audience="creator"
              className="mr-4 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] text-xs cursor-pointer bg-transparent border-none p-0"
            >
              For creators
            </HomeAudienceLink>
            <a href="#">Pricing</a>
            <a href="#">Help</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </nav>
        </footer>
      </div>

    </div>
  );
}
