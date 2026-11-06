'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

const IDLE_LIMIT = 30 * 60 * 1000
const WARNING_AT = 25 * 60 * 1000
const WARNING_WINDOW = IDLE_LIMIT - WARNING_AT
const ACTIVITY_KEY = 'sirtis-last-activity'
const SIGNED_OUT_URL = '/auth/signin?reason=idle'

function readActivity() {
  const stored = Number(window.localStorage.getItem(ACTIVITY_KEY) || 0)
  return Number.isFinite(stored) ? stored : 0
}

function writeActivity(time = Date.now()) {
  window.localStorage.setItem(ACTIVITY_KEY, String(time))
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function IdleSessionGuard() {
  const { status, update } = useSession()
  const [warning, setWarning] = useState(false)
  const [remaining, setRemaining] = useState(WARNING_WINDOW)
  const [signingOut, setSigningOut] = useState(false)
  const wasAuthenticated = useRef(false)
  const originalTitle = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticated.current = true
      return
    }
    if (status === 'unauthenticated' && wasAuthenticated.current) {
      wasAuthenticated.current = false
      const idle = Date.now() - readActivity()
      if (readActivity() && idle >= WARNING_AT) {
        window.localStorage.removeItem(ACTIVITY_KEY)
        window.location.href = SIGNED_OUT_URL
      }
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return

    if (!readActivity()) writeActivity()

    let lastServerRefresh = Date.now()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const

    const onActivity = () => {
      if (document.visibilityState === 'hidden') return
      const idle = Date.now() - readActivity()
      if (idle >= WARNING_AT) return
      writeActivity()
    }

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }))

    const timer = window.setInterval(() => {
      const idle = Date.now() - readActivity()
      if (idle >= IDLE_LIMIT) {
        setSigningOut(true)
        setWarning(true)
        window.localStorage.removeItem(ACTIVITY_KEY)
        void signOut({ callbackUrl: SIGNED_OUT_URL })
        return
      }
      if (idle >= WARNING_AT) {
        setWarning(true)
        setRemaining(IDLE_LIMIT - idle)
        return
      }
      setWarning(false)
      if (Date.now() - lastServerRefresh > 2 * 60 * 1000 && idle < 60 * 1000) {
        lastServerRefresh = Date.now()
        void update()
      }
    }, 1000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity))
      window.clearInterval(timer)
    }
  }, [status, update])

  useEffect(() => {
    if (warning && !signingOut) {
      if (originalTitle.current === null) originalTitle.current = document.title
      document.title = `(${formatRemaining(remaining)}) Still there? - SIRTIS`
    } else if (originalTitle.current !== null) {
      document.title = originalTitle.current
      originalTitle.current = null
    }
  }, [warning, signingOut, remaining])

  const staySignedIn = () => {
    writeActivity()
    setWarning(false)
    setRemaining(WARNING_WINDOW)
    void update()
  }

  const signOutNow = () => {
    setSigningOut(true)
    window.localStorage.removeItem(ACTIVITY_KEY)
    void signOut({ callbackUrl: SIGNED_OUT_URL })
  }

  if (status !== 'authenticated' || !warning) return null

  const progress = Math.max(0, Math.min(1, remaining / WARNING_WINDOW))
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const urgent = remaining <= 60 * 1000

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-session-title"
        aria-describedby="idle-session-description"
      >
        <div className="flex items-start gap-4">
          {!signingOut && (
            <div className="relative h-20 w-20 shrink-0" aria-hidden="true">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="none"
                  stroke={urgent ? '#dc2626' : '#ea580c'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-base font-bold ${urgent ? 'text-red-600' : 'text-gray-900'}`}>
                {formatRemaining(remaining)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-orange-600">Security check</p>
            <h2 id="idle-session-title" className="mt-1 text-xl font-semibold text-gray-900">
              {signingOut ? 'Signing you out' : 'Are you still there?'}
            </h2>
            <p id="idle-session-description" className="mt-2 text-sm leading-6 text-gray-600">
              {signingOut
                ? 'Your session reached 30 minutes without activity, so SIRTIS is signing you out to protect this account.'
                : `You have been inactive for a while. For your security, SIRTIS will sign you out in ${formatRemaining(remaining)} unless you choose to stay signed in.`}
            </p>
          </div>
        </div>

        {!signingOut && (
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={signOutNow} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Sign out now
            </button>
            <button
              type="button"
              onClick={staySignedIn}
              autoFocus
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Stay signed in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
