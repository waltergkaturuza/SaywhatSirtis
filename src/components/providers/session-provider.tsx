"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { IdleSessionGuard } from "@/components/auth/idle-session-guard"
import { PasswordExpiryPrompt } from "@/components/auth/password-expiry-prompt"

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider refetchInterval={60} refetchOnWindowFocus>
      {children}
      <PasswordExpiryPrompt />
      <IdleSessionGuard />
    </NextAuthSessionProvider>
  )
}
