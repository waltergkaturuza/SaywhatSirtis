'use client'

import { useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  ShieldExclamationIcon, 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Suspense } from 'react'

function UnauthorizedContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  const requiredRoles = searchParams.get('required')?.split(',') || []
  const userRoles = (session?.user?.roles as string[]) || []
  const currentRole = searchParams.get('current') || userRoles[0] || 'Unknown'

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldExclamationIcon className="w-12 h-12 text-red-600" />
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access this resource
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Current Role */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Your Current Role:</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-blue-800">
                {formatRole(currentRole)}
              </p>
            </div>

            {/* Required Roles */}
            {requiredRoles.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-900">Required Role(s):</span>
                </div>
                <div className="mt-2 space-y-1">
                  {requiredRoles.map((role) => (
                    <span 
                      key={role}
                      className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded mr-2"
                    >
                      {formatRole(role)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Access Restricted</p>
                  <p className="mt-1">
                    This page requires higher privileges. Please contact your administrator 
                    if you believe you should have access to this resource.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              <Link 
                href="/dashboard"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>

            {/* Contact Information */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Need access? Contact your system administrator at{' '}
                <a 
                  href="mailto:admin@saywhat.org" 
                  className="text-blue-600 hover:text-blue-500"
                >
                  admin@saywhat.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  )
}
