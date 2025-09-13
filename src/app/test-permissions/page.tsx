"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { 
  UserIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon 
} from "@heroicons/react/24/outline";

export default function UserPermissionsTestPage() {
  const { data: session } = useSession();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Test users for quick login
  const testUsers = [
    {
      email: "admin@saywhat.org",
      password: "admin123",
      name: "System Administrator",
      description: "Full system access to all modules"
    },
    {
      email: "mary.chikuni@saywhat.org", 
      password: "officer123",
      name: "Mary Chikuni - Call Centre Officer",
      description: "Call Centre access only"
    },
    {
      email: "callcentre.head@saywhat.org",
      password: "callcentre123", 
      name: "Call Centre Head",
      description: "Full Call Centre management access"
    },
    {
      email: "me@saywhat.org",
      password: "me123",
      name: "M&E Officer",
      description: "Programs M&E access"
    },
    {
      email: "hr@saywhat.org",
      password: "hr123",
      name: "HR Manager", 
      description: "HR module full access"
    }
  ];

  // Module permissions to test
  const modulePermissions = [
    {
      module: "Call Centre",
      permissions: ["callcentre.access", "callcentre.officer", "callcentre.admin", "callcentre.cases"]
    },
    {
      module: "Programs",
      permissions: ["programs.view", "programs.create", "programs.me_access", "programs.head"]
    },
    {
      module: "HR",
      permissions: ["hr.view", "hr.full_access", "hr.employees"]
    },
    {
      module: "Analytics",
      permissions: ["analytics.view", "analytics.full_access", "dashboard.full_access"]
    },
    {
      module: "System Admin",
      permissions: ["system.admin", "system.users", "system.settings"]
    }
  ];

  const hasPermission = (permission: string) => {
    return session?.user?.permissions?.includes(permission) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Permissions Test Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Test user logins and verify permissions across all system modules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current User Session */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Current Session
              </h2>
            </div>
            <div className="p-6">
              {session ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-sm text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department & Position</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {session.user?.department} - {session.user?.position}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roles</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {session.user?.roles?.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Permissions ({session.user?.permissions?.length || 0})
                    </label>
                    <div className="mt-1 max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {session.user?.permissions?.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                          >
                            <CheckCircleIcon className="mr-1 h-3 w-3" />
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Session</h3>
                  <p className="mt-1 text-sm text-gray-500">Please sign in to test permissions</p>
                  <a
                    href="/auth/signin"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Test Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="mr-2 h-5 w-5" />
                Test User Accounts
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {testUsers.map((user) => (
                  <div
                    key={user.email}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{user.description}</p>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {user.password}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Use these credentials on the <a href="/auth/signin" className="text-blue-600 hover:text-blue-500">sign-in page</a> to test different permission levels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Permissions Matrix */}
        {session && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ShieldCheckIcon className="mr-2 h-5 w-5" />
                Permission Matrix for {session.user?.name}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modulePermissions.map((module) => (
                  <div key={module.module} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{module.module}</h3>
                    <div className="space-y-2">
                      {module.permissions.map((permission) => {
                        const hasAccess = hasPermission(permission);
                        return (
                          <div key={permission} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{permission}</span>
                            {hasAccess ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation Test */}
        {session && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <KeyIcon className="mr-2 h-5 w-5" />
                Quick Module Access Test
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/call-centre"
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    hasPermission("callcentre.access")
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-red-200 bg-red-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-medium">Call Centre</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hasPermission("callcentre.access") ? "✓ Access Granted" : "✗ Access Denied"}
                  </div>
                </a>

                <a
                  href="/programs"
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    hasPermission("programs.view")
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-red-200 bg-red-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-medium">Programs</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hasPermission("programs.view") ? "✓ Access Granted" : "✗ Access Denied"}
                  </div>
                </a>

                <a
                  href="/hr"
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    hasPermission("hr.view")
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-red-200 bg-red-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-medium">HR</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hasPermission("hr.view") ? "✓ Access Granted" : "✗ Access Denied"}
                  </div>
                </a>

                <a
                  href="/dashboard"
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    hasPermission("dashboard.view") || session.user?.roles?.includes("admin")
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-red-200 bg-red-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-medium">Dashboard</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hasPermission("dashboard.view") || session.user?.roles?.includes("admin") ? "✓ Access Granted" : "✗ Access Denied"}
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
