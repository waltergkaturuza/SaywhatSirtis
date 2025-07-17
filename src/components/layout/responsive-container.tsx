"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsivePageContainerProps {
  children: ReactNode
  hasFloatingElements?: boolean
  hasSidebar?: boolean
  className?: string
}

export function ResponsivePageContainer({
  children,
  hasFloatingElements = true,
  hasSidebar = false,
  className
}: ResponsivePageContainerProps) {
  const containerClasses = cn(
    "min-h-screen",
    // Add bottom padding when floating elements are present
    hasFloatingElements && "pb-20 sm:pb-16",
    // Add right padding when sidebar is present
    hasSidebar && "lg:pr-80",
    className
  )

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

// Floating element spacing utility
export const floatingElementSpacing = {
  // Z-index layers
  zIndex: {
    modal: 1000,
    popover: 900,
    floating: 50,
    header: 40,
    sidebar: 30,
    content: 10
  },
  
  // Spacing presets
  spacing: {
    xs: "0.5rem", // 8px
    sm: "1rem",   // 16px
    md: "1.5rem", // 24px
    lg: "2rem",   // 32px
    xl: "3rem"    // 48px
  },
  
  // Safe area calculations
  safeArea: {
    bottom: "5rem", // 80px - enough for floating buttons
    right: "5rem",  // 80px - enough for sidebar toggle
    mobile: "4rem"  // 64px - reduced for mobile
  }
}

// Hook to calculate safe positioning
export function useSafeFloatingPosition(
  basePosition: { bottom?: number; right?: number; top?: number; left?: number },
  context?: { hasSidebar?: boolean; isMobile?: boolean }
) {
  const { hasSidebar = false, isMobile = false } = context || {}
  
  const safePosition = { ...basePosition }
  
  // Adjust for mobile
  if (isMobile) {
    if (safePosition.bottom) safePosition.bottom = Math.max(safePosition.bottom, 64)
    if (safePosition.right) safePosition.right = Math.max(safePosition.right, 16)
    if (safePosition.left) safePosition.left = Math.max(safePosition.left, 16)
  } else {
    // Desktop adjustments
    if (safePosition.bottom) safePosition.bottom = Math.max(safePosition.bottom, 80)
    if (hasSidebar && safePosition.right) {
      safePosition.right = Math.max(safePosition.right, 320) // sidebar width + margin
    }
  }
  
  return safePosition
}
