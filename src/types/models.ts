/**
 * Shared raw join shapes from Supabase PostgREST queries.
 *
 * Supabase infers join fields differently from our domain types — these
 * "Raw" types capture what actually comes back from the DB so that the
 * as-unknown-as casts at page boundaries have a documented target.
 */

// Shape of: users!matches_creator_id_fkey(id, name, avatar_url, creator_profiles(profile_photo_url))
// creator_profiles may be an object or single-element array depending on the join path.
export type RawCreatorJoin = {
  id: string;
  name: string;
  avatar_url: string | null;
  creator_profiles:
    | { profile_photo_url: string | null }
    | { profile_photo_url: string | null }[]
    | null;
};

// Shape of a matches row with campaign + creator + messages joins.
// Used in matches/layout.tsx to build the sidebar group list.
export type RawMatchRow = {
  id: string;
  campaign_id: string;
  created_at: string;
  campaigns: { id: string; title: string | null } | null;
  creator: RawCreatorJoin | null;
  messages: { content: string; sender_id: string; created_at: string }[] | null;
};

// Extracts profile_photo_url from a creator join, handling both array and object shapes.
export function extractProfilePhoto(creator: RawCreatorJoin | null): string | null {
  if (!creator) return null;
  const cp = Array.isArray(creator.creator_profiles)
    ? creator.creator_profiles[0] ?? null
    : creator.creator_profiles ?? null;
  return cp?.profile_photo_url ?? null;
}
