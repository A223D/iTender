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
          className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss disabled:opacity-60"
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
        <p className="rounded-2xl bg-black/[0.04] px-4 py-3 text-sm text-ink/55">
          No account found for <span className="font-medium text-ink">{email}</span>.
        </p>
      ) : null}

      {/* Deleted confirmation */}
      {status === "deleted" ? (
        <div className="rounded-2xl border border-moss/20 bg-moss/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-moss">Account deleted ✓</p>
          <p className="mt-0.5 text-xs text-ink/55">All data, files, and the auth identity have been removed.</p>
        </div>
      ) : null}

      {/* Error */}
      {status === "error" ? (
        <div className="rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-coral">Deletion failed</p>
          <p className="mt-0.5 text-xs text-ink/55">{errorMsg}</p>
        </div>
      ) : null}

      {/* Found user card */}
      {found && (status === "found" || status === "confirming" || status === "deleting" || status === "error") ? (
        <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{found.name}</p>
              <p className="text-xs text-ink/45">{found.email}</p>
              <p className="mt-1 text-xs text-ink/35">
                {found.role} · Member since {memberSince}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-ink/25">{found.id}</p>
            </div>

            {/* Actions */}
            <div className="shrink-0">
              {status === "found" ? (
                <button
                  type="button"
                  onClick={() => setStatus("confirming")}
                  className="rounded-xl bg-coral px-3 py-1.5 text-xs font-bold text-white transition hover:bg-coral/90"
                >
                  Delete account
                </button>
              ) : null}
              {status === "deleting" ? (
                <span className="text-xs text-ink/40">Deleting…</span>
              ) : null}
            </div>
          </div>

          {/* Inline confirmation */}
          {status === "confirming" ? (
            <div className="mt-4 rounded-xl border border-coral/20 bg-coral/[0.05] px-4 py-3">
              <p className="text-sm font-semibold text-coral">Permanently delete this account?</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/55">
                This will wipe all campaigns, chats, messages, files, and the login identity for{" "}
                <span className="font-medium text-ink">{found.name}</span>. This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("found")}
                  className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-black/20 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl bg-coral px-3 py-1.5 text-xs font-bold text-white transition hover:bg-coral/90"
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
