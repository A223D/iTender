"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServiceClient } from "@/utils/supabase/service";
import { executeUserDeletion } from "@/lib/delete-user";
import { AdminUserSearch } from "./search";

// ── Server Actions ─────────────────────────────────────────────────────────────

async function authenticateAdmin(formData: FormData) {
  "use server";
  const secret = formData.get("secret")?.toString() ?? "";
  const cookieStore = await cookies();
  if (secret === process.env.ADMIN_SECRET) {
    cookieStore.set("admin_session", process.env.ADMIN_SECRET!, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600,
      path: "/admin",
    });
  }
  redirect("/admin/users");
}

async function searchUser(email: string) {
  "use server";
  const service = createServiceClient();
  const { data } = await service
    .from("users")
    .select("id, name, role, created_at, email")
    .ilike("email", email.trim())
    .limit(1)
    .single();
  return data ?? null;
}

async function deleteUserAsAdmin(userId: string) {
  "use server";
  return executeUserDeletion(userId);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const session = cookieStore.get("admin_session");
  const isAuthenticated =
    session && session.value === process.env.ADMIN_SECRET;
  const hasError = (await params)?.error === "invalid";

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
              S
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">Admin Access</p>
              <p className="mt-1 text-sm text-ink/45">Enter the admin secret to continue</p>
            </div>
          </div>

          <form action={authenticateAdmin} className="space-y-4">
            <input
              type="password"
              name="secret"
              autoFocus
              placeholder="Admin secret"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
            {hasError ? (
              <p className="rounded-xl bg-coral/[0.07] px-4 py-2.5 text-sm text-coral">
                Incorrect secret. Try again.
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98]"
            >
              Continue →
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-xs font-bold text-white shadow-glow">
            S
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">User Management</h1>
          <p className="mt-1 text-sm text-ink/45">Search for an account and delete all associated data.</p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white p-8 shadow-[0_20px_45px_rgba(22,20,18,0.08)]">
          <AdminUserSearch
            searchUser={searchUser}
            deleteUser={deleteUserAsAdmin}
          />
        </div>

        <p className="mt-6 text-center text-xs text-ink/30">
          Deletions are permanent and cannot be undone.
        </p>
      </div>
    </main>
  );
}
