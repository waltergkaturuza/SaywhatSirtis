"use client"

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function ClearAuthPage() {
  const [cleared, setCleared] = useState(false)
  const { data: session, status } = useSession()

  const clearAuthCookies = () => {
    // Clear NextAuth cookies
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = '__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;'
    document.cookie = '__Host-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;'
    
    // Clear any other session-related cookies
    document.cookie = 'sirtis-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Clear local storage
    localStorage.clear()
    sessionStorage.clear()
    
    setCleared(true)
    
    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/auth/signin'
    }, 2000)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    clearAuthCookies()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Clear Authentication Data
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Having authentication issues? This will clear all session data.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {status === 'loading' ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saywhat-orange mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Checking session status...</p>
            </div>
          ) : cleared ? (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Authentication Data Cleared</h3>
              <p className="mt-1 text-sm text-gray-500">
                Redirecting to sign in page in 2 seconds...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {session && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Active Session Detected
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        You are currently signed in as {session.user?.email}. 
                        We recommend signing out first, then clearing cookies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {session ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-saywhat-orange hover:bg-saywhat-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saywhat-orange"
                  >
                    Sign Out and Clear Data
                  </button>
                ) : (
                  <button
                    onClick={clearAuthCookies}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Clear Authentication Cookies
                  </button>
                )}
                
                <Link href="/auth/signin" 
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saywhat-orange">
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            This page helps resolve JWT decryption errors and authentication issues.
          </p>
        </div>
      </div>
    </div>
  )
}