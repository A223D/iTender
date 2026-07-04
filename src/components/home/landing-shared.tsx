"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";

import type { Audience } from "@/lib/audience";

export type Theme = "dark" | "light";
export type WaitlistRole = "creator" | "brand";

export type WaitlistFormState = {
  name: string;
  email: string;
  phone: string;
  instagramHandle: string;
  companyName: string;
  websiteUrl: string;
};

export const initialWaitlistForm: WaitlistFormState = {
  name: "",
  email: "",
  phone: "",
  instagramHandle: "",
  companyName: "",
  websiteUrl: "",
};

export function validateWaitlistForm(form: WaitlistFormState, role: WaitlistRole) {
  if (!form.name.trim()) return "Enter your name.";
  if (!form.email.trim() && !form.phone.trim()) return "Enter an email or phone number.";
  if (role === "creator" && !form.instagramHandle.trim()) return "Enter your Instagram handle.";
  if (role === "brand" && !form.companyName.trim()) return "Enter your company name.";
  return "";
}

export function getWaitlistRole(audience: Audience): WaitlistRole {
  return audience === "business" ? "brand" : "creator";
}

export const WAITLIST_ANCHOR_ID = "waitlist";
export const WAITLIST_FORM_ID = "waitlist-form";

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

export function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
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

export function ScoutMark({ theme, size }: { theme: Theme; size: number }) {
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

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  // Use the class already set by the layout inline script (which checks localStorage + OS)
  if (document.documentElement.classList.contains("light")) return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  // Fallback to OS preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setFavicon(theme: Theme) {
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

// ── Nav ──────────────────────────────────────────────────────────────────────

export function Nav({
  aud, theme, setTheme, onJoinWaitlist, homeHref = "#top", sectionPrefix = "",
}: {
  aud: Audience;
  theme: Theme; setTheme: (t: Theme) => void;
  onJoinWaitlist: (which: Audience) => void;
  homeHref?: string;
  sectionPrefix?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="v2-nav">
        <a href={homeHref} className="scout-focus" onClick={close} style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)", flexShrink: 0 }}>
          <ScoutMark theme={theme} size={28} />
          <span style={{ fontWeight: 900, letterSpacing: "-0.01em", fontSize: 17 }}>Scout</span>
        </a>
        <nav className="v2-nav-links">
          <a href={`${sectionPrefix}#why`} className="v2-nav-link">Why Scout?</a>
          <a href={`${sectionPrefix}#showcase`} className="v2-nav-link">How it works</a>
          <a href="/waitlist" className="v2-nav-link">Waitlist</a>
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
            <a href={`${sectionPrefix}#why`} className="v2-mobile-menu-link" onClick={close}>Why Scout?</a>
            <a href={`${sectionPrefix}#showcase`} className="v2-mobile-menu-link" onClick={close}>How it works</a>
            <a href="/waitlist" className="v2-mobile-menu-link" onClick={close}>Waitlist</a>
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

// ── Waitlist form ────────────────────────────────────────────────────────────

export function WaitlistSection({
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
    <section className="v2-section v2-waitlist-page-section">
      <div className="v2-container">
        <div id={WAITLIST_ANCHOR_ID} className="v2-waitlist v2-reveal">
          <div className="v2-waitlist-copy">
            <h2 className="v2-h2" style={{ color: "var(--accent)" }}>Join the Paid Collab Pool</h2>
            <p className="v2-sub">
              Be among the first to try Scout paid collabs. Tell us a bit about yourself so we can bring the right creators and businesses onto the platform as we grow.
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

// ── Footer ───────────────────────────────────────────────────────────────────

export function Footer({
  theme, onJoinWaitlist, onShowHowItWorks, homeHref = "#top",
}: {
  theme: Theme;
  onJoinWaitlist: (w: Audience) => void;
  onShowHowItWorks: (w: Audience) => void;
  homeHref?: string;
}) {
  return (
    <footer className="v2-footer">
      <div className="v2-container">
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <a href={homeHref} style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--color-text)" }}>
              <ScoutMark theme={theme} size={26} />
              <span style={{ fontWeight: 900, fontSize: 16 }}>Scout</span>
            </a>
            <p>The link between creators and businesses.</p>
          </div>
          <div>
            <h4>Creators</h4>
            <ul>
              <li><button type="button" onClick={() => onJoinWaitlist("creator")}>Join creator waitlist</button></li>
              <li><button type="button" onClick={() => onShowHowItWorks("creator")}>How it works</button></li>
            </ul>
          </div>
          <div>
            <h4>Businesses</h4>
            <ul>
              <li><button type="button" onClick={() => onJoinWaitlist("business")}>Join business waitlist</button></li>
              <li><button type="button" onClick={() => onShowHowItWorks("business")}>How it works</button></li>
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
