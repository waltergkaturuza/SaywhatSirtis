import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
        },
        expires: session.expires
      } : null,
      authOptions: {
        configured: true,
        providers: ["credentials"],
        url: process.env.NEXTAUTH_URL
      },
      instructions: session ? null : {
        message: "To authenticate, visit /auth/signin",
        credentials: {
          email: "admin@saywhat.org",
          password: "admin123"
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check authentication",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
