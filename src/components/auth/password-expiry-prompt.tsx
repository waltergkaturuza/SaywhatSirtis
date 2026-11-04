'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

type PasswordStatus = {
  isDue: boolean
  daysLeft: number
  dueAt: string
  maxAgeDays: number
  hasPassword: boolean
}

const SNOOZE_HOURS = 24
const REMINDER_DAYS = 5
const WORDS = ['Harare', 'Sunrise', 'Baobab', 'Zambezi', 'Granite', 'Falcon', 'Meadow', 'Copper', 'Horizon', 'Kopje']
const SYMBOLS = ['!', '#', '$', '%', '&', '*', '?', '@']

function suggestPassword() {
  const values = new Uint32Array(5)
  window.crypto.getRandomValues(values)
  const first = WORDS[values[0] % WORDS.length]
  let second = WORDS[values[1] % WORDS.length]
  if (second === first) second = WORDS[(values[1] + 1) % WORDS.length]
  const number = String(10 + (values[2] % 90))
  return `${first}${SYMBOLS[values[3] % SYMBOLS.length]}${second}${number}${SYMBOLS[values[4] % SYMBOLS.length]}`
}

function passwordChecks(value: string) {
  return [
    { label: 'At least 12 characters', ok: value.length >= 12 },
    { label: 'An uppercase letter (A-Z)', ok: /[A-Z]/.test(value) },
    { label: 'A lowercase letter (a-z)', ok: /[a-z]/.test(value) },
    { label: 'A number (0-9)', ok: /\d/.test(value) },
    { label: 'A symbol such as ! # $ % & * ?', ok: /[!@#$%^&*(),.?":{}|<>]/.test(value) }
  ]
}

export function PasswordExpiryPrompt() {
  const { data: session, status } = useSession()
  const userId = (session?.user as { id?: string } | undefined)?.id
  const snoozeKey = userId ? `sirtis-password-snooze-${userId}` : ''

  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null)
  const [open, setOpen] = useState(false)
  const [reminder, setReminder] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [example, setExample] = useState('Harare#Sunrise2026!')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !userId) return
    let cancelled = false

    fetch('/api/auth/password-status')
      .then((response) => (response.ok ? response.json() : null))
      .then((result: PasswordStatus | null) => {
        if (cancelled || !result?.hasPassword) return
        setPasswordStatus(result)
        const snoozedUntil = Number(window.localStorage.getItem(snoozeKey) || 0)
        const snoozed = snoozedUntil > Date.now()
        if (result.isDue && !snoozed) setOpen(true)
        else if (!result.isDue && result.daysLeft <= REMINDER_DAYS && !snoozed) setReminder(true)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [status, userId, snoozeKey])

  const checks = useMemo(() => passwordChecks(newPassword), [newPassword])
  const strongEnough = checks.every((check) => check.ok)
  const matches = newPassword.length > 0 && newPassword === confirmPassword

  const snooze = () => {
    if (snoozeKey) window.localStorage.setItem(snoozeKey, String(Date.now() + SNOOZE_HOURS * 60 * 60 * 1000))
    setOpen(false)
    setReminder(false)
  }

  const useExample = () => {
    setNewPassword(example)
    setConfirmPassword(example)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!strongEnough) {
      setError('Your new password does not meet every requirement yet.')
      return
    }
    if (!matches) {
      setError('The new passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const response = await fetch('/api/employee/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const details = Array.isArray(result.details) ? ` ${result.details.join(' ')}` : ''
        setError(`${result.error || 'Unable to change your password.'}${details}`)
        return
      }
      if (snoozeKey) window.localStorage.removeItem(snoozeKey)
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      window.setTimeout(() => {
        setOpen(false)
        setReminder(false)
        setDone(false)
      }, 2500)
    } catch {
      setError('Unable to change your password. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status !== 'authenticated' || !passwordStatus) return null

  if (reminder && !open) {
    return (
      <div className="fixed bottom-4 left-4 z-[70] w-full max-w-sm rounded-2xl border border-orange-200 bg-white p-4 shadow-xl">
        <p className="text-sm font-semibold text-gray-900">Your password expires soon</p>
        <p className="mt-1 text-sm text-gray-600">
          {passwordStatus.daysLeft === 1 ? 'It expires tomorrow.' : `It expires in ${passwordStatus.daysLeft} days.`} SIRTIS asks for a new password every {passwordStatus.maxAgeDays} days.
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={snooze} className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Later
          </button>
          <button type="button" onClick={() => { setReminder(false); setOpen(true) }} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
            Change now
          </button>
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="password-expiry-title">
        <p className="text-sm font-medium text-orange-600">Security check</p>
        <h2 id="password-expiry-title" className="mt-1 text-xl font-semibold text-gray-900">
          {done ? 'Password changed' : passwordStatus.isDue ? 'Time to change your password' : 'Change your password'}
        </h2>

        {done ? (
          <p className="mt-3 text-sm text-gray-600">Your new password is saved. You will be asked again in {passwordStatus.maxAgeDays} days.</p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              To keep SIRTIS secure, every password is changed every {passwordStatus.maxAgeDays} days. Choose one you have not used before.
            </p>

            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3">
              <p className="text-xs font-medium text-gray-700">Example of a strong password</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="truncate text-sm font-semibold text-gray-900" title={example}>{example}</code>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setExample(suggestPassword())} className="rounded-md px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100">
                    Another
                  </button>
                  <button type="button" onClick={useExample} className="rounded-md px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100">
                    Use this
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-600">Two unrelated words, a number, and symbols. Make your own, and never share it.</p>
            </div>

            <div className="mt-4 space-y-3">
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" required />
              <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" required />
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" required />
            </div>

            <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {checks.map((check) => (
                <li key={check.label} className={`text-xs ${check.ok ? 'text-green-700' : 'text-gray-500'}`}>
                  {check.ok ? '✓' : '•'} {check.label}
                </li>
              ))}
              <li className={`text-xs ${matches ? 'text-green-700' : 'text-gray-500'}`}>{matches ? '✓' : '•'} Both new passwords match</li>
            </ul>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={snooze} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Remind me tomorrow
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Change password'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
