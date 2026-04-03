"use client"

/**
 * Upload one file to Supabase via /api/inventory/assets/upload (authenticated).
 */
export async function uploadInventoryAssetFile(
  file: File,
  kind: "image" | "document"
): Promise<{ path: string; displayName: string }> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("kind", kind)
  const res = await fetch("/api/inventory/assets/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Upload failed (${res.status})`)
  }
  const path = (data as { path?: string }).path
  const displayName = (data as { displayName?: string }).displayName
  if (!path) throw new Error("Upload succeeded but no path returned")
  return { path, displayName: displayName || file.name }
}
