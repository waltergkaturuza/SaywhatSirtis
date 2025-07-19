import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { OfflineProvider, OfflineIndicator, OfflineSyncStatus } from "@/components/ui/offline-support"
import { LiveRegion } from "@/components/ui/accessibility"
import ErrorBoundary from "@/components/ui/error-boundary"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SIRTIS - SAYWHAT Integrated Real-Time Information System",
  description: "AI-powered integrated platform for SAYWHAT's operational departments",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>
              <QueryProvider>
                <ToastProvider>
                  <OfflineProvider>
                    {children}
                    <OfflineIndicator />
                    <OfflineSyncStatus />
                    <LiveRegion />
                  </OfflineProvider>
                </ToastProvider>
              </QueryProvider>
            </SessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
