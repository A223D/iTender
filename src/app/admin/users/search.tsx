"use client";

import { useState } from "react";

type FoundUser = {
  id: string;
  name: string;
  role: string;
  created_at: string;
  email: string;
} | null;

type Status = "idle" | "searching" | "found" | "not-found" | "confirming" | "deleting" | "deleted" | "error";

type Props = {
  searchUser: (email: string) => Promise<FoundUser>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
};

export function AdminUserSearch({ searchUser, deleteUser }: Props) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<NonNullable<FoundUser> | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("searching");
    setFound(null);
    setErrorMsg("");
    const user = await searchUser(email);
    if (user) {
      setFound(user);
      setStatus("found");
    } else {
      setStatus("not-found");
    }
  }

  async function handleDelete() {
    if (!found) return;
    setStatus("deleting");
    setErrorMsg("");
    const result = await deleteUser(found.id);
    if (result.success) {
      setFound(null);
      setEmail("");
      setStatus("deleted");
    } else {
      setErrorMsg(result.error ?? "Deletion failed. Check server logs.");
      setStatus("error");
    }
  }

  const memberSince = found
    ? new Date(found.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "searching") setStatus("idle");
          }}
          placeholder="user@example.com"
          disabled={status === "searching" || status === "deleting"}
          className="flex-1 rounded-2xl border border-white/10 glass px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-hint)] focus:border-white/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!email.trim() || status === "searching" || status === "deleting"}
          className="rounded-2xl bg-moss px-4 py-2.5 text-sm font-bold text-white transition hover:bg-moss/90 disabled:opacity-50"
        >
          {status === "searching" ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Not found */}
      {status === "not-found" ? (
        <p className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          No account found for <span className="font-medium text-[var(--color-text)]">{email}</span>.
        </p>
      ) : null}

      {/* Deleted confirmation */}
      {status === "deleted" ? (
        <div className="rounded-2xl border border-moss/20 bg-moss/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-moss">Account deleted ✓</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">All data, files, and the auth identity have been removed.</p>
        </div>
      ) : null}

      {/* Error */}
      {status === "error" ? (
        <div className="rounded-2xl border border-error/20 bg-error/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-error">Deletion failed</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{errorMsg}</p>
        </div>
      ) : null}

      {/* Found user card */}
      {found && (status === "found" || status === "confirming" || status === "deleting" || status === "error") ? (
        <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--color-text)]">{found.name}</p>
              <p className="text-xs text-[var(--color-text-hint)]">{found.email}</p>
              <p className="mt-1 text-xs text-[var(--color-text-hint)]">
                {found.role} · Member since {memberSince}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[var(--color-text-hint)]">{found.id}</p>
            </div>

            {/* Actions */}
            <div className="shrink-0">
              {status === "found" ? (
                <button
                  type="button"
                  onClick={() => setStatus("confirming")}
                  className="rounded-xl bg-error px-3 py-1.5 text-xs font-bold text-white transition hover:bg-error/90"
                >
                  Delete account
                </button>
              ) : null}
              {status === "deleting" ? (
                <span className="text-xs text-[var(--color-text-hint)]">Deleting…</span>
              ) : null}
            </div>
          </div>

          {/* Inline confirmation */}
          {status === "confirming" ? (
            <div className="mt-4 rounded-xl border border-error/20 bg-error/[0.05] px-4 py-3">
              <p className="text-sm font-semibold text-error">Permanently delete this account?</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                This will wipe all campaigns, chats, messages, files, and the login identity for{" "}
                <span className="font-medium text-[var(--color-text)]">{found.name}</span>. This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("found")}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-white/20 hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl bg-error px-3 py-1.5 text-xs font-bold text-white transition hover:bg-error/90"
                >
                  Yes, delete permanently
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}


