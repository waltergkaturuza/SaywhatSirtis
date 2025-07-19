'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Screen reader announcement hook
export function useAnnouncement() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, `${priority}:${message}`])
  }

  useEffect(() => {
    if (announcements.length > 0) {
      const timer = setTimeout(() => {
        setAnnouncements(prev => prev.slice(1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [announcements])

  return { announce, announcements }
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Live region for screen reader announcements
export function LiveRegion() {
  const { announcements } = useAnnouncement()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="sr-only">
      {announcements.map((announcement, index) => {
        const [priority, message] = announcement.split(':')
        return (
          <div
            key={index}
            aria-live={priority as 'polite' | 'assertive'}
            aria-atomic="true"
          >
            {message}
          </div>
        )
      })}
    </div>,
    document.body
  )
}

// Skip link component
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  )
}

// Focus trap hook
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        container.focus()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive])

  return containerRef
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const checkHighContrast = () => {
      const supportsHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      setIsHighContrast(supportsHighContrast)
    }

    checkHighContrast()
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    mediaQuery.addEventListener('change', checkHighContrast)

    return () => mediaQuery.removeEventListener('change', checkHighContrast)
  }, [])

  return isHighContrast
}

// Reduced motion preference detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

export function AccessibleButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

// Accessible modal component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function AccessibleModal({ isOpen, onClose, title, children, className = '' }: AccessibleModalProps) {
  const focusTrapRef = useFocusTrap(isOpen)
  const { announce } = useAnnouncement()

  useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened`, 'assertive')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, title, announce])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={focusTrapRef}
        className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
        tabIndex={-1}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Accessible form field component
interface AccessibleFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  description?: string
}

export function AccessibleField({ id, label, error, required, children, description }: AccessibleFieldProps) {
  const describedBy = [
    description && `${id}-description`,
    error && `${id}-error`
  ].filter(Boolean).join(' ')

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={`${id}-description`} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        <div 
          id={id}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
        >
          {children}
        </div>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible table component
interface AccessibleTableProps {
  caption?: string
  headers: string[]
  rows: (string | React.ReactNode)[][]
  className?: string
}

export function AccessibleTable({ caption, headers, rows, className = '' }: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Keyboard navigation hook
export function useKeyboardNavigation(items: any[], onSelect: (item: any) => void) {
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0) {
          onSelect(items[activeIndex])
        }
        break
      case 'Escape':
        setActiveIndex(-1)
        break
    }
  }

  return { activeIndex, handleKeyDown }
}

// ARIA live region hook
export function useAriaLive() {
  const [liveMessage, setLiveMessage] = useState('')
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')

  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level)
    setLiveMessage(message)
    
    // Clear message after a short delay to allow for re-announcements
    setTimeout(() => {
      setLiveMessage('')
    }, 1000)
  }

  const LiveRegionComponent = () => (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {liveMessage}
    </div>
  )

  return { announce, LiveRegionComponent }
}
