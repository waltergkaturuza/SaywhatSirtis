'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

const IDLE_LIMIT = 30 * 60 * 1000
const WARNING_AT = 25 * 60 * 1000
const ACTIVITY_KEY = 'sirtis-last-activity'

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
  const [remaining, setRemaining] = useState(IDLE_LIMIT - WARNING_AT)
  const [signingOut, setSigningOut] = useState(false)

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
        void signOut({ callbackUrl: '/auth/signin?reason=idle' })
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

  const staySignedIn = () => {
    writeActivity()
    setWarning(false)
    void update()
  }

  const signOutNow = () => {
    setSigningOut(true)
    window.localStorage.removeItem(ACTIVITY_KEY)
    void signOut({ callbackUrl: '/auth/signin?reason=idle' })
  }

  if (status !== 'authenticated' || !warning) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="idle-session-title">
        <p className="text-sm font-medium text-orange-600">Security check</p>
        <h2 id="idle-session-title" className="mt-1 text-xl font-semibold text-gray-900">
          {signingOut ? 'Signing you out' : 'You have been inactive'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {signingOut
            ? 'Your session reached 30 minutes without activity, so SIRTIS is signing you out to protect this account.'
            : 'For your security, SIRTIS signs you out after 30 minutes without activity. Stay signed in to keep working, or sign out now.'}
        </p>
        {!signingOut && (
          <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-center text-sm text-gray-800">
            Signing out in <span className="font-semibold text-gray-900">{formatRemaining(remaining)}</span>
          </p>
        )}
        {!signingOut && (
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={signOutNow} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Sign out now
            </button>
            <button type="button" onClick={staySignedIn} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Stay signed in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
