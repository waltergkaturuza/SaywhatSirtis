"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
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
  size = "lg", // Changed default to large
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

  const [activeButton, setActiveButton] = useState<string | null>(null)

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-3 text-lg" // Made larger
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6" // Made larger
  }

  const getButtonClass = (buttonKey: string) => cn(
    "inline-flex items-center border-2 shadow-lg leading-4 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95",
    sizeClasses[size],
    activeButton === buttonKey 
      ? "bg-green-500 border-green-600 text-white shadow-green-200" // Green when clicked
      : "bg-orange-500 border-orange-600 text-white hover:bg-orange-600 focus:bg-orange-600 shadow-orange-200", // Orange by default
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
  )

  const handleButtonClick = (buttonKey: string, action: () => void) => {
    setActiveButton(buttonKey)
    // Reset the active state after a short delay
    setTimeout(() => setActiveButton(null), 300)
    action()
  }

  const buttons = []

  // Home button
  if (showHome && showHomeButton) {
    buttons.push(
      <button
        key="home"
        onClick={() => handleButtonClick('home', goHome)}
        className={getButtonClass('home')}
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
        onClick={() => handleButtonClick('back', goBack)}
        className={getButtonClass('back')}
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
        onClick={() => handleButtonClick('module-home', goToModuleHome)}
        className={getButtonClass('module-home')}
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
    <div className={cn("flex items-center space-x-3", className)}>
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
