import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  buildAssetStoragePath,
  getInventoryAssetsBucket,
  assetFileDisplayName,
} from "@/lib/inventory/asset-storage"
import { uploadToSupabaseStorage, ensureBucketExists } from "@/lib/storage/supabase-storage"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_DOC_BYTES = 10 * 1024 * 1024

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
])

const DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp"])
const DOC_EXT = new Set(["pdf", "doc", "docx", "xls", "xlsx"])

function extOf(name: string): string {
  return (name.split(".").pop() || "").toLowerCase()
}

function canUploadInventory(session: Session | null): boolean {
  if (!session?.user) return false
  const p = (session.user.permissions as string[] | undefined) || []
  const roles = ((session.user.roles as string[] | undefined) || []).map((r: string) =>
    r.toLowerCase()
  )
  if (roles.includes("admin")) return true
  return (
    p.includes("inventory.create") ||
    p.includes("inventory.edit") ||
    p.includes("inventory.full_access")
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!canUploadInventory(session)) {
      return NextResponse.json({ error: "Insufficient permissions for inventory uploads" }, { status: 403 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "File storage is not configured (Supabase env missing)" },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const kindRaw = (formData.get("kind") as string) || "document"

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const kind = kindRaw === "image" ? "image" : "document"
    const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_DOC_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File exceeds ${maxBytes / (1024 * 1024)}MB limit` }, { status: 400 })
    }

    let mime = file.type || "application/octet-stream"
    const ext = extOf(file.name)
    if (kind === "image") {
      if (!IMAGE_TYPES.has(mime) && IMAGE_EXT.has(ext)) {
        if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg"
        else if (ext === "png") mime = "image/png"
        else if (ext === "gif") mime = "image/gif"
        else if (ext === "webp") mime = "image/webp"
      }
      if (!IMAGE_TYPES.has(mime)) {
        return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })
      }
    } else {
      if (!DOC_TYPES.has(mime) && DOC_EXT.has(ext)) {
        if (ext === "pdf") mime = "application/pdf"
        else if (ext === "doc") mime = "application/msword"
        else if (ext === "docx")
          mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else if (ext === "xls") mime = "application/vnd.ms-excel"
        else if (ext === "xlsx")
          mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
      if (!DOC_TYPES.has(mime)) {
        return NextResponse.json({ error: "Unsupported document type" }, { status: 400 })
      }
    }

    const bucket = getInventoryAssetsBucket()
    const storagePath = buildAssetStoragePath(kind === "image" ? "images" : "documents", file.name)

    await ensureBucketExists(bucket)

    const uploadResult = await uploadToSupabaseStorage({
      bucket,
      path: storagePath,
      file,
      contentType: mime,
      upsert: false,
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Upload failed" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      path: storagePath,
      bucket,
      displayName: assetFileDisplayName(storagePath),
      publicUrl: uploadResult.publicUrl,
    })
  } catch (e) {
    console.error("inventory assets upload:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    )
  }
}
