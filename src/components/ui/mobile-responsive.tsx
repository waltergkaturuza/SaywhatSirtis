'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mobile breakpoint detection hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

// Device type detection
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  return deviceType
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClass?: string
  tabletClass?: string
  desktopClass?: string
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  mobileClass = '',
  tabletClass = '',
  desktopClass = ''
}: ResponsiveContainerProps) {
  const deviceType = useDeviceType()
  
  const deviceClass = {
    mobile: mobileClass,
    tablet: tabletClass,
    desktop: desktopClass
  }[deviceType]

  return (
    <div className={cn(className, deviceClass)}>
      {children}
    </div>
  )
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
}

export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-4'
}: ResponsiveGridProps) {
  const gridClasses = cn(
    'grid',
    gap,
    `grid-cols-${cols.mobile || 1}`,
    `md:grid-cols-${cols.tablet || 2}`,
    `lg:grid-cols-${cols.desktop || 3}`,
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Mobile drawer component
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  position?: 'left' | 'right' | 'bottom'
}

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  children, 
  title,
  position = 'left' 
}: MobileDrawerProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isMobile) return null

  const positionClasses = {
    left: 'left-0 top-0 h-full w-80 transform -translate-x-full',
    right: 'right-0 top-0 h-full w-80 transform translate-x-full',
    bottom: 'bottom-0 left-0 right-0 h-96 transform translate-y-full'
  }

  const translateClasses = {
    left: 'translate-x-0',
    right: 'translate-x-0',
    bottom: 'translate-y-0'
  }

  return (
    <div className={cn(
      'fixed inset-0 z-50 lg:hidden',
      isOpen ? 'block' : 'hidden'
    )}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn(
        'fixed bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300',
        positionClasses[position],
        isOpen ? translateClasses[position] : ''
      )}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: TouchButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile-optimized table component
interface MobileTableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  className?: string
}

export function MobileTable({ headers, rows, className = '' }: MobileTableProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {headers[cellIndex]}
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {cell}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
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

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '' 
}: SwipeableCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return (
    <div
      className={cn('touch-pan-x', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  )
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const maxPullDistance = 100
  const refreshThreshold = 60

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touchY = e.touches[0].clientY
    const distance = touchY - touchStart
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, maxPullDistance))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > refreshThreshold) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    setTouchStart(null)
  }

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 transition-all duration-200"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="text-blue-600 dark:text-blue-400">
            {pullDistance > refreshThreshold ? '↓ Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  )
}

// Viewport height utility for mobile Safari
export function useViewportHeight() {
  const [vh, setVh] = useState('100vh')

  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      setVh(`${window.innerHeight}px`)
    }

    updateVh()
    window.addEventListener('resize', updateVh)
    
    return () => window.removeEventListener('resize', updateVh)
  }, [])

  return vh
}
