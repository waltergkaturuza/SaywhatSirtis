import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPasswordStatus } from '@/lib/password-expiry'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return NextResponse.json({ success: true, ...(await getPasswordStatus(userId)) })
  } catch (error) {
    console.error('Password status error:', error)
    return NextResponse.json({ error: 'Unable to check password status' }, { status: 500 })
  }
}
