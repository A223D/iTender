import { createServiceClient } from "@/utils/supabase/service";

export async function executeUserDeletion(userId: string): Promise<{
  success: boolean;
  error?: string;
  storageWarnings?: string[];
}> {
  const service = createServiceClient();

  // ── Phase 1: Atomic DB deletion via Postgres RPC ──────────────────────────
  // All 9 DELETE steps run inside a single transaction in delete_user_data().
  // If any step fails, Postgres rolls back everything — account is fully intact.
  const { error: rpcError } = await service.rpc("delete_user_data", { p_user_id: userId });
  if (rpcError) {
    console.error(`[delete-user] RPC failed for ${userId}:`, rpcError.message);
    return { success: false, error: rpcError.message };
  }

  // ── Phase 2: Auth identity deletion ──────────────────────────────────────
  // Must happen after the public.users row is gone.
  // If this fails: DB is clean but email is still "taken" in Supabase Auth.
  // Log the userId — a manual retry of only this step resolves the state.
  const { error: authError } = await service.auth.admin.deleteUser(userId);
  if (authError) {
    console.error(
      `[delete-user] PARTIAL DELETION — auth.admin.deleteUser failed for ${userId}:`,
      authError.message,
    );
    return {
      success: false,
      error: "Your account data has been deleted but we could not fully remove your login. Please contact support to complete the process.",
    };
  }

  // ── Phase 3: Storage cleanup (best effort) ────────────────────────────────
  // All user files are stored under {userId}/ in each bucket.
  // Failures here are non-fatal: orphaned files have no DB reference and
  // cannot be accessed by other users.
  const storageWarnings: string[] = [];

  for (const bucket of ["profile-images", "campaign-images"]) {
    try {
      const { data: files, error: listError } = await service.storage
        .from(bucket)
        .list(userId, { limit: 1000 });

      if (listError) {
        storageWarnings.push(`${bucket}: list failed — ${listError.message}`);
        continue;
      }

      const paths = (files ?? []).map((f) => `${userId}/${f.name}`);
      if (paths.length === 0) continue;

      const { error: removeError } = await service.storage.from(bucket).remove(paths);
      if (removeError) {
        storageWarnings.push(`${bucket}: remove failed — ${removeError.message}`);
      }
    } catch (e) {
      storageWarnings.push(`${bucket}: unexpected error`);
      console.error(`[delete-user] Storage cleanup failed for ${bucket}/${userId}:`, e);
    }
  }

  if (storageWarnings.length > 0) {
    console.warn(`[delete-user] Storage cleanup incomplete for ${userId}:`, storageWarnings);
  }

  return { success: true, storageWarnings };
}
