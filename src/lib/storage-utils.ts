/** Extracts the storage path from a Supabase public URL for a given bucket. */
export function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}
