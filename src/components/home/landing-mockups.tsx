// CSS-driven mini mockups for the business landing page.
// These are non-interactive decorative replicas of the real product UI.

export function WindowFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="l-window">
      <div className="l-window-chrome">
        <span className="l-window-dot" />
        <span className="l-window-dot" />
        <span className="l-window-dot" />
        <span className="l-window-title">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function MockupMatches() {
  return (
    <div className="mk mk-matches">
      {/* Pane 1: campaigns */}
      <div>
        <div className="mk-row" style={{ marginBottom: 6 }}>
          <span style={{ margin: 0, fontSize: 9, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", letterSpacing: "0.1em", textTransform: "uppercase" }}>CAMPAIGNS</span>
          <span style={{ marginLeft: "auto" }} className="mk-pill unread">7</span>
        </div>
        {[
          { i: "SS", label: "Spring Drop", active: true, badge: "4" },
          { i: "SP", label: "Summer Pop-Up", active: false },
          { i: "SC", label: "Studio Caps", active: false },
          { i: "FS", label: "Founders Ser.", active: false },
        ].map((row) => (
          <div key={row.i} className={`mk-matches-row${row.active ? " active" : ""}`}>
            <span className="mk-av" style={{ width: 18, height: 18, fontSize: 8 }}>{row.i}</span>
            <span className="l">{row.label}</span>
            {row.badge ? <span className="mk-pill unread" style={{ minWidth: 12, height: 12, fontSize: 8 }}>{row.badge}</span> : null}
          </div>
        ))}
      </div>

      {/* Pane 2: threads */}
      <div>
        <span style={{ margin: 0, fontSize: 9, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", letterSpacing: "0.1em", textTransform: "uppercase" }}>THREADS</span>
        {[
          { i: "JR", dot: true, active: false },
          { i: "MO", dot: true, active: true },
          { i: "PS", dot: false, active: false },
          { i: "SG", dot: false, active: false },
          { i: "RV", dot: false, active: false },
        ].map((row) => (
          <div key={row.i} className={`mk-matches-row${row.active ? " active" : ""}`} style={{ padding: "6px 4px" }}>
            {row.dot ? <span className="mk-dot" /> : <span style={{ width: 5 }} />}
            <span className="mk-av" style={{ width: 24, height: 24, fontSize: 9 }}>{row.i}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mk-bar long" style={{ height: 4 }} />
              <div className="mk-bar medium" style={{ height: 3, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Pane 3: chat */}
      <div style={{ gap: 0, padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid var(--color-divider)" }}>
          <span className="mk-av" style={{ width: 22, height: 22, fontSize: 9 }}>MO</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Maya Okafor</p>
            <p style={{ margin: 0, fontSize: 9, color: "var(--color-text-hint)" }}>@mayaplays · 18.4k</p>
          </div>
          <span className="mk-pill cyan">MATCHED</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: 10, overflow: "hidden" }}>
          <div className="mk-bubble them">Could I shoot Friday morning instead? Light is better in my space.</div>
          <div className="mk-bubble me">Friday works — locking it.</div>
          <div className="mk-bubble them">Kit arrived this morning btw, packaging is gorgeous.</div>
          <div className="mk-bubble me">Glad you like it. Sending you the brief now.</div>
        </div>
        <div style={{ padding: "8px 10px", borderTop: "1px solid var(--color-divider)" }}>
          <div style={{ height: 24, borderRadius: 6, background: "var(--color-tile)", border: "1px solid var(--color-divider)", display: "flex", alignItems: "center", padding: "0 8px" }}>
            <span style={{ fontSize: 9.5, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)" }}>Message Maya…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockupDashboard() {
  const cards = [
    { t: "Spring Skincare Drop", d: "9d", stack: 3 },
    { t: "Summer Pop-Up Tour", d: "22d", stack: 2 },
    { t: "Studio Capsule", d: "34d", stack: 0 },
    { t: "Founders Series", d: "18d", stack: 2 },
  ];
  return (
    <div className="mk mk-card-grid">
      {cards.map((c) => (
        <div key={c.t} className="mk-card">
          <div className="mk-card-hero">
            <span className="chip">{c.d} left</span>
          </div>
          <div className="mk-card-body">
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>{c.t}</p>
            <div className="mk-bar long" style={{ height: 4 }} />
            <div className="mk-bar medium" style={{ height: 4 }} />
            <div style={{ marginTop: "auto", display: "flex", gap: 4 }}>
              <span className="mk-pill">paid</span>
              <span className="mk-pill">UGC</span>
            </div>
          </div>
          <div className="mk-card-foot">
            <span>{c.stack ? `${c.stack * 4} interested` : "no interest yet"}</span>
            <span className="stack">
              {Array.from({ length: c.stack }).map((_, j) => <span key={j} className="a" />)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MockupReview() {
  const applicants = [
    { i: "MO", n: "Maya Okafor", sel: false, check: true },
    { i: "JR", n: "Jordan Reyes", sel: true, check: false },
    { i: "PS", n: "Priya Shah", sel: false, check: true },
    { i: "SG", n: "Sam Greene", sel: false, check: false },
    { i: "RV", n: "Reese Vu", sel: false, check: true },
  ];
  return (
    <div className="mk mk-review">
      <div className="left">
        <div className="mk-row" style={{ marginBottom: 4 }}>
          <span style={{ margin: 0, fontSize: 9, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", letterSpacing: "0.06em", textTransform: "uppercase" }}>APPLICANTS</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", fontSize: 9, color: "var(--color-text-hint)" }}>14</span>
        </div>
        {applicants.map((c) => (
          <div key={c.i} className={`mk-review-row${c.sel ? " active" : ""}`}>
            <span className={`mk-check${c.check ? " on" : ""}`}>{c.check ? "✓" : ""}</span>
            <span className="mk-av" style={{ width: 20, height: 20, fontSize: 9 }}>{c.i}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: c.sel ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.n}</p>
              <div className="mk-bar medium" style={{ height: 3, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="right" style={{ padding: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span className="mk-av" style={{ width: 44, height: 44, fontSize: 13 }}>JR</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>Jordan Reyes</p>
            <p style={{ margin: "2px 0 0", fontSize: 9.5, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)" }}>@jordanr · Austin, TX</p>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <span className="mk-pill cyan">lifestyle</span>
              <span className="mk-pill cyan">wellness</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flex: "none" }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--color-tile)", display: "grid", placeItems: "center", color: "var(--color-text-muted)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2v11l-5 8a2 2 0 0 1-4-1v-6H3a2 2 0 0 1-2-2l2-8a2 2 0 0 1 2-2h12z"/></svg>
            </div>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: "#67E8F9", display: "grid", placeItems: "center", color: "#020617" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 22V11l5-8a2 2 0 0 1 4 1v6h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7z"/></svg>
            </div>
          </div>
        </div>

        <div className="mk-glass" style={{ marginTop: 10, padding: "8px 10px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 9.5 }}>
          {[
            { label: "IG", value: "24k", accent: false },
            { label: "TT", value: "8.1k", accent: false },
            { label: "ENG", value: "5.4%", accent: true },
          ].map((s) => (
            <div key={s.label}>
              <span style={{ display: "block", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)", fontSize: 8, color: "var(--color-text-hint)", letterSpacing: "0.06em" }}>{s.label}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: s.accent ? "#67E8F9" : undefined, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <p style={{ margin: "0 0 4px", fontSize: 9.5, fontWeight: 600 }}>Pitch</p>
          <div className="mk-bar long" style={{ height: 4 }} />
          <div className="mk-bar long" style={{ height: 4, marginTop: 4 }} />
          <div className="mk-bar medium" style={{ height: 4, marginTop: 4 }} />
        </div>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
          <div className="ph-image" style={{ aspectRatio: "4/5", borderRadius: 4, fontSize: 7 }}>IG · Mar</div>
          <div className="ph-image" style={{ aspectRatio: "4/5", borderRadius: 4, fontSize: 7 }}>IG · Feb</div>
          <div className="ph-image" style={{ aspectRatio: "4/5", borderRadius: 4, fontSize: 7 }}>TT · Feb</div>
        </div>
      </div>
    </div>
  );
}

export function MockupPhone() {
  const navIcons = [
    <svg key="inbox" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    <svg key="campaigns" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>,
    <svg key="messages" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    <svg key="user" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ];
  return (
    <div className="mk-phone">
      <span className="notch" />
      <div className="mk-phone-inner">
        <div className="mk-card">
          <div className="mk-card-hero" style={{ height: 80 }}>
            <span className="chip">9d left</span>
          </div>
          <div className="mk-card-body" style={{ padding: "8px 10px" }}>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Spring Skincare Drop</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)" }}>$400 + product</p>
          </div>
        </div>
        <div className="mk-card">
          <div className="mk-card-hero" style={{ height: 60 }} />
          <div className="mk-card-body" style={{ padding: "8px 10px" }}>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>Summer Pop-Up Tour</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--color-text-hint)", fontFamily: "var(--font-mono,'JetBrains Mono',monospace)" }}>$650 + travel</p>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-around", padding: "6px 0 2px" }}>
          {navIcons.map((icon, n) => (
            <span key={n} style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", color: "var(--color-text-hint)" }}>
              {icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupBrowser() {
  const sideIcons = [
    <svg key="campaigns" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    <svg key="messages" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    <svg key="settings" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  ];
  return (
    <div className="mk-browser mk">
      <div className="mk-browser-bar">
        <div className="l-window-dot" style={{ width: 8, height: 8 }} />
        <div className="l-window-dot" style={{ width: 8, height: 8 }} />
        <div className="l-window-dot" style={{ width: 8, height: 8 }} />
        <div className="url">scout.app/dashboard</div>
      </div>
      <div className="mk-browser-body">
        <div className="side">
          {sideIcons.map((icon, i) => (
            <span key={i} style={{ width: 22, height: 22, borderRadius: 5, background: i === 1 ? "rgba(255,255,255,0.10)" : "transparent", display: "grid", placeItems: "center", color: "var(--color-text-muted)", margin: "0 auto" }}>
              {icon}
            </span>
          ))}
        </div>
        <div className="main">
          <div className="mk-bar medium" style={{ height: 6 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mk-card" style={{ minHeight: 80 }}>
                <div className="mk-card-hero" style={{ height: 32 }} />
                <div className="mk-card-body" style={{ padding: 6, gap: 4 }}>
                  <div className="mk-bar long" style={{ height: 4 }} />
                  <div className="mk-bar medium" style={{ height: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
