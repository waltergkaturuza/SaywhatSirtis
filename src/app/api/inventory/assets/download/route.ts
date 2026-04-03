import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getInventoryAssetsBucket, isAssetStoragePath } from "@/lib/inventory/asset-storage"
import { getSignedUrl } from "@/lib/storage/supabase-storage"

function canDownloadInventory(session: Session | null): boolean {
  if (!session?.user) return false
  const p = (session.user.permissions as string[] | undefined) || []
  const roles = ((session.user.roles as string[] | undefined) || []).map((r: string) =>
    r.toLowerCase()
  )
  if (roles.includes("admin")) return true
  return (
    p.includes("inventory.view") ||
    p.includes("inventory.create") ||
    p.includes("inventory.edit") ||
    p.includes("inventory.full_access")
  )
}

/**
 * Redirect to a short-lived signed URL for a stored asset file (private buckets).
 * Query: path — object path within the inventory bucket (e.g. inventory/assets/images/...).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canDownloadInventory(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    if (!path || !isAssetStoragePath(path)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }

    const bucket = getInventoryAssetsBucket()
    const signed = await getSignedUrl(bucket, path, 3600)
    if (!signed.success || !signed.url) {
      return NextResponse.json(
        { error: signed.error || "Could not generate download link" },
        { status: 502 }
      )
    }

    return NextResponse.redirect(signed.url, 302)
  } catch (e) {
    console.error("inventory assets download:", e)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
