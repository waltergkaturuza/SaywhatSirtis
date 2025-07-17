"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  PlusIcon,
  HomeIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface FloatingAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray"
}

interface FloatingActionButtonProps {
  primaryAction?: FloatingAction
  secondaryActions?: FloatingAction[]
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  className?: string
}

export function FloatingActionButton({
  primaryAction,
  secondaryActions = [],
  position = "bottom-right",
  className
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const positionClasses = {
    "bottom-right": "bottom-4 right-4 mb-2 mr-2",
    "bottom-left": "bottom-4 left-4 mb-2 ml-2", 
    "top-right": "top-24 right-4 mt-2 mr-2",
    "top-left": "top-24 left-4 mt-2 ml-2"
  }

  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    gray: "bg-gray-600 hover:bg-gray-700 text-white"
  }

  const defaultPrimaryAction: FloatingAction = {
    icon: PlusIcon,
    label: "Add",
    color: "blue"
  }

  const defaultSecondaryActions: FloatingAction[] = [
    {
      icon: HomeIcon,
      label: "Home",
      href: "/",
      color: "gray"
    },
    {
      icon: ArrowLeftIcon,
      label: "Back",
      onClick: () => router.back(),
      color: "gray"
    }
  ]

  const primary = primaryAction || defaultPrimaryAction
  const secondary = secondaryActions.length > 0 ? secondaryActions : defaultSecondaryActions

  const renderActionButton = (action: FloatingAction, isPrimary = false) => {
    const buttonClass = cn(
      "flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
      colorClasses[action.color || "blue"],
      isPrimary ? "w-14 h-14" : ""
    )

    const content = (
      <>
        <action.icon className={isPrimary ? "h-7 w-7" : "h-6 w-6"} />
        <span className="sr-only">{action.label}</span>
      </>
    )

    if (action.href) {
      return (
        <Link href={action.href} className={buttonClass} title={action.label}>
          {content}
        </Link>
      )
    }

    return (
      <button
        onClick={action.onClick}
        className={buttonClass}
        title={action.label}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={cn("fixed z-50 transition-all duration-200", positionClasses[position], className)}>
      {/* Secondary Actions */}
      {isOpen && secondary.length > 0 && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2 mr-2">
          {secondary.map((action, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 animate-in slide-in-from-bottom duration-200"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both"
              }}
            >
              <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-90 whitespace-nowrap shadow-lg">
                {action.label}
              </span>
              {renderActionButton(action)}
            </div>
          ))}
        </div>
      )}

      {/* Primary Action Button */}
      <div className="relative">
        {secondary.length > 0 ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
              colorClasses[primary.color || "blue"]
            )}
            title={isOpen ? "Close" : "More actions"}
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7 transition-transform duration-200" />
            ) : (
              <EllipsisVerticalIcon className="h-7 w-7 transition-transform duration-200" />
            )}
          </button>
        ) : (
          renderActionButton(primary, true)
        )}
      </div>
    </div>
  )
}

// Quick Navigation Component for common navigation patterns
interface QuickNavigationProps {
  showHome?: boolean
  showBack?: boolean
  customActions?: FloatingAction[]
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  compact?: boolean
  showLabels?: boolean
}

export function QuickNavigation({
  showHome = true,
  showBack = true,
  customActions = [],
  position = "bottom-right",
  compact = true,
  showLabels = false
}: QuickNavigationProps) {
  const router = useRouter()

  const actions: FloatingAction[] = []

  if (showHome) {
    actions.push({
      icon: HomeIcon,
      label: "Home",
      href: "/",
      color: "blue"
    })
  }

  if (showBack) {
    actions.push({
      icon: ArrowLeftIcon,
      label: "Back",
      onClick: () => router.back(),
      color: "gray"
    })
  }

  actions.push(...customActions)

  // Don't render if no actions
  if (actions.length === 0) return null

  return (
    <FloatingActionButton
      secondaryActions={actions}
      position={position}
      className="transform transition-all duration-200 hover:scale-105"
    />
  )
}
