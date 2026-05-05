"use client";

import { useEffect } from "react";

// Replaces the root layout on catastrophic errors — must include <html> + <body>.
// Tailwind may not load, so critical styles are inlined. Colours match the
// marketing design language so it's consistent with not-found and error pages
// once the full CSS is wired up later.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "24px",
          background: "#0A0A0B",
          fontFamily: "system-ui, sans-serif",
          color: "#F0EDE8",
        }}
      >
        <p style={{ fontSize: "7rem", fontWeight: 700, lineHeight: 1, margin: 0, opacity: 0.12 }}>
          500
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem", marginBottom: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "0.875rem", opacity: 0.45, maxWidth: 360, marginTop: "0.5rem", lineHeight: 1.6 }}>
          A critical error occurred. Please refresh the page or try again.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "1px solid rgba(240,237,232,0.15)",
              background: "transparent",
              color: "rgba(240,237,232,0.7)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "linear-gradient(to right, #E8614A, #7C5CBF)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go to Dashboard →
          </a>
        </div>
        {error.digest ? (
          <p style={{ marginTop: "2rem", fontFamily: "monospace", fontSize: "0.7rem", opacity: 0.2 }}>
            Error ID: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
