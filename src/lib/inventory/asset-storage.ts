/**
 * Supabase Storage layout for inventory files (same pattern as document repo: bucket + path).
 * Paths are stored in assets.images / assets.documents (string[]).
 */

export const ASSET_STORAGE_PREFIX = "inventory/assets"

/** Server-only: bucket name (defaults to `documents` like /api/documents/upload). */
export function getInventoryAssetsBucket(): string {
  return process.env.SUPABASE_INVENTORY_BUCKET?.trim() || "documents"
}

export function isAssetStoragePath(p: string | undefined | null): boolean {
  return !!p && p.startsWith(`${ASSET_STORAGE_PREFIX}/`)
}

/** Human-friendly label from stored path (drops timestamp_random_ prefix). */
export function assetFileDisplayName(p: string): string {
  const seg = p.split("/").pop() || p
  return seg.replace(/^\d+_[a-f0-9]{6,}[_-]/i, "") || seg
}

export function buildAssetStoragePath(
  kind: "images" | "documents",
  originalFilename: string
): string {
  const safe = sanitizeFilename(originalFilename)
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  return `${ASSET_STORAGE_PREFIX}/${kind}/${unique}_${safe}`
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "file"
  return base.slice(0, 180)
}
