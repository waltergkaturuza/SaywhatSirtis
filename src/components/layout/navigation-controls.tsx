"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { 
  HomeIcon, 
  ArrowLeftIcon, 
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { useNavigationState } from "@/hooks/use-navigation"

interface NavigationControlsProps {
  className?: string
  showHome?: boolean
  showBack?: boolean
  showModuleHome?: boolean
  customButtons?: React.ReactNode[]
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
  compact?: boolean
}

export function NavigationControls({
  className,
  showHome = true,
  showBack = true,
  showModuleHome = true,
  customButtons = [],
  size = "md",
  showLabels = true,
  compact = false
}: NavigationControlsProps) {
  const { 
    showHomeButton, 
    showBackButton, 
    showModuleHomeButton,
    goHome,
    goBack,
    goToModuleHome,
    currentModule,
    pathSegments
  } = useNavigationState()

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const baseButtonClass = cn(
    "inline-flex items-center border border-gray-300 shadow-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
    sizeClasses[size]
  )

  const buttons = []

  // Home button
  if (showHome && showHomeButton) {
    buttons.push(
      <button
        key="home"
        onClick={goHome}
        className={baseButtonClass}
        title="Go to Dashboard"
      >
        <HomeIcon className={cn(iconSizes[size], showLabels ? "mr-2" : "")} />
        {showLabels && !compact && "Home"}
      </button>
    )
  }

  // Back button
  if (showBack && showBackButton) {
    buttons.push(
      <button
        key="back"
        onClick={goBack}
        className={baseButtonClass}
        title="Go back to previous page"
      >
        <ArrowLeftIcon className={cn(iconSizes[size], showLabels ? "mr-2" : "")} />
        {showLabels && !compact && "Back"}
      </button>
    )
  }

  // Module home button
  if (showModuleHome && showModuleHomeButton && currentModule) {
    const moduleName = currentModule.charAt(0).toUpperCase() + currentModule.slice(1)
    buttons.push(
      <button
        key="module-home"
        onClick={goToModuleHome}
        className={baseButtonClass}
        title={`Go to ${moduleName} home`}
      >
        <ArrowUturnLeftIcon className={cn(iconSizes[size], showLabels ? "mr-2" : "")} />
        {showLabels && !compact && moduleName}
      </button>
    )
  }

  // Add custom buttons
  buttons.push(...customButtons)

  if (buttons.length === 0) return null

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {buttons}
    </div>
  )
}

interface BreadcrumbsProps {
  items: Array<{
    name: string
    href?: string
  }>
  className?: string
  separator?: "chevron" | "slash"
}

export function Breadcrumbs({ 
  items, 
  className,
  separator = "chevron" 
}: BreadcrumbsProps) {
  if (!items.length) return null

  const SeparatorIcon = separator === "chevron" ? ChevronRightIcon : null

  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <>
                {SeparatorIcon ? (
                  <SeparatorIcon className="w-5 h-5 text-gray-400 mx-1" />
                ) : (
                  <span className="mx-2 text-gray-400">/</span>
                )}
              </>
            )}
            {item.href ? (
              <Link 
                href={item.href} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold text-sm">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Array<{ name: string; href?: string }>
  actions?: React.ReactNode
  navigationControls?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  navigationControls,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("bg-white shadow rounded-lg", className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        {/* Top row: Navigation Controls and Actions */}
        <div className="flex justify-between items-center mb-4">
          {/* Left side: Navigation Controls */}
          <div className="flex items-center">
            {navigationControls}
          </div>
          
          {/* Right side: Actions */}
          {actions && (
            <div className="flex space-x-3">
              {actions}
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Title and Description */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-base text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
