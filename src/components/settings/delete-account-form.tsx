"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

type State = "idle" | "modal-open" | "deleting" | "error";

export function DeleteAccountForm({
  userId,
  brandName,
}: {
  userId: string;
  brandName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [confirmInput, setConfirmInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const canConfirm = confirmInput === brandName;

  function openModal() {
    setConfirmInput("");
    setErrorMsg("");
    setState("modal-open");
  }

  function closeModal() {
    if (state === "deleting") return;
    setState("idle");
    setConfirmInput("");
    setErrorMsg("");
  }

  async function handleDelete() {
    setState("deleting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      // Auth identity is deleted server-side — signOut cleans up local cookies.
      // The call may fail (identity already gone), which is expected — ignore the error.
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openModal}
        className="mt-4 rounded-2xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-text)] hover:text-[var(--color-on-text)] active:scale-[0.98]"
      >
        Delete my account
      </button>

      {/* Modal */}
      {state !== "idle" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="glass-ambient w-full max-w-md rounded-3xl p-8">
            {/* Icon + title */}
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">Delete your account?</h2>
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            {/* What gets deleted */}
            <ul className="mb-6 space-y-2 rounded-2xl bg-white/[0.06] px-5 py-4 text-sm text-[var(--color-text-muted)]">
              {[
                "Your brand profile and logo",
                "All campaigns and uploaded images",
                "All creator matches and conversations",
                "All messages",
                "Your account and login access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-hint)]" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Brand name confirmation */}
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-text-muted)]">
                Type <span className="font-semibold text-[var(--color-text)]">{brandName}</span> to confirm:
              </span>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => {
                  setConfirmInput(e.target.value);
                  if (state === "error") setState("modal-open");
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && canConfirm) handleDelete(); }}
                disabled={state === "deleting"}
                placeholder={brandName}
                autoFocus
                className="input-recessed w-full rounded-2xl px-4 py-3 text-sm outline-none disabled:opacity-60"
              />
            </label>

            {/* Error */}
            {state === "error" ? (
              <p className="mt-3 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
                {errorMsg}
              </p>
            ) : null}

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={state === "deleting"}
                className="flex-1 rounded-2xl border border-white/[0.12] px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-white/[0.24] hover:text-[var(--color-text)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canConfirm || state === "deleting"}
                className="flex-1 rounded-2xl bg-[var(--color-text)] px-4 py-3 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state === "deleting" ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
