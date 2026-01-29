import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for storage operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export interface UploadOptions {
  bucket: string
  path: string
  file: File | Buffer
  contentType?: string
  upsert?: boolean
  cacheControl?: string
}

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  publicUrl?: string
  signedUrl?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToSupabaseStorage(options: UploadOptions): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient()
    const { bucket, path, file, contentType, upsert = false, cacheControl = '3600' } = options

    // Convert File to Buffer if needed
    let fileBuffer: Buffer
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      fileBuffer = file
    }

    // Determine content type
    const mimeType = contentType || (file instanceof File ? file.type : 'application/octet-stream')

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert,
        cacheControl
      })

    if (error) {
      console.error('❌ Supabase Storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL (if bucket is public)
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    // Generate signed URL (valid for 1 hour by default, can be extended)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600) // 1 hour expiry

    return {
      success: true,
      path: data.path,
      url: signedUrlData?.signedUrl || publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
      signedUrl: signedUrlData?.signedUrl
    }
  } catch (error) {
    console.error('❌ Supabase Storage upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get a signed URL for a file in Supabase Storage
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      url: data.signedUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get public URL for a file (if bucket is public)
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Check if a file exists in Supabase Storage
 */
export async function fileExists(bucket: string, path: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.storage.from(bucket).list(
      path.split('/').slice(0, -1).join('/'),
      {
        limit: 1,
        search: path.split('/').pop() || ''
      }
    )

    return !error && (data?.length || 0) > 0
  } catch {
    return false
  }
}

/**
 * Ensure a storage bucket exists (creates if it doesn't)
 * Note: This requires admin/service role key
 */
export async function ensureBucketExists(bucket: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient()

    // List buckets to check if it exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return {
        success: false,
        error: `Failed to list buckets: ${listError.message}`
      }
    }

    const bucketExists = buckets?.some(b => b.name === bucket)

    if (bucketExists) {
      return { success: true }
    }

    // Note: Creating buckets via API requires admin privileges
    // In production, buckets should be created via Supabase Dashboard
    // This is a helper that checks existence only
    console.warn(`⚠️  Bucket "${bucket}" does not exist. Please create it in Supabase Dashboard.`)
    return {
      success: false,
      error: `Bucket "${bucket}" does not exist. Please create it in Supabase Dashboard.`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
