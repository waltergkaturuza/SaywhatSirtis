"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FloatingContainerProps {
  children: ReactNode
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  offset?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  zIndex?: number
  className?: string
}

export function FloatingContainer({
  children,
  position = "bottom-right",
  offset = {},
  zIndex = 50,
  className
}: FloatingContainerProps) {
  const defaultOffset = {
    top: 6,
    right: 6,
    bottom: 6,
    left: 6,
    ...offset
  }

  const positionClasses = {
    "bottom-right": `bottom-${defaultOffset.bottom} right-${defaultOffset.right}`,
    "bottom-left": `bottom-${defaultOffset.bottom} left-${defaultOffset.left}`,
    "top-right": `top-${defaultOffset.top} right-${defaultOffset.right}`,
    "top-left": `top-${defaultOffset.top} left-${defaultOffset.left}`
  }

  const positionStyles = {
    "bottom-right": {
      bottom: `${defaultOffset.bottom * 0.25}rem`,
      right: `${defaultOffset.right * 0.25}rem`
    },
    "bottom-left": {
      bottom: `${defaultOffset.bottom * 0.25}rem`,
      left: `${defaultOffset.left * 0.25}rem`
    },
    "top-right": {
      top: `${defaultOffset.top * 0.25}rem`,
      right: `${defaultOffset.right * 0.25}rem`
    },
    "top-left": {
      top: `${defaultOffset.top * 0.25}rem`,
      left: `${defaultOffset.left * 0.25}rem`
    }
  }

  return (
    <div
      className={cn(
        "fixed",
        `z-${zIndex}`,
        className
      )}
      style={positionStyles[position]}
    >
      {children}
    </div>
  )
}

// Safe area component to ensure content doesn't overlap with floating elements
interface SafeAreaProps {
  children: ReactNode
  floatingElements?: {
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left"
    size: "sm" | "md" | "lg"
  }[]
  className?: string
}

export function SafeArea({
  children,
  floatingElements = [],
  className
}: SafeAreaProps) {
  const getPadding = () => {
    let padding = ""
    
    floatingElements.forEach(element => {
      switch (element.position) {
        case "bottom-right":
          padding += " pr-20 pb-20"
          break
        case "bottom-left":
          padding += " pl-20 pb-20"
          break
        case "top-right":
          padding += " pr-20 pt-20"
          break
        case "top-left":
          padding += " pl-20 pt-20"
          break
      }
    })
    
    return padding
  }

  return (
    <div className={cn("relative", getPadding(), className)}>
      {children}
    </div>
  )
}
