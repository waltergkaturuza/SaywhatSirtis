import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface Breadcrumb {
  name: string
  href: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.name}>
                <div className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <a
                    href={breadcrumb.href}
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-500'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {breadcrumb.name}
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
