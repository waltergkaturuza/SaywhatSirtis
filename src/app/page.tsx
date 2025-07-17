import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard/dashboard"
import AuthWrapper from "@/components/auth/auth-wrapper"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  )
}
