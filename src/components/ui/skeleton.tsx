"use client"

import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton = ({ className = "", ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  )
}

// Skeleton variants for common use cases
export const SkeletonText = ({ lines = 3, className = "" }: { lines?: number; className?: string }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export const SkeletonCard = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  )
}

export const SkeletonTable = ({ 
  rows = 5, 
  cols = 4, 
  className = "" 
}: { 
  rows?: number; 
  cols?: number; 
  className?: string 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex space-x-4 mb-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4 mb-3">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={`h-4 ${colIndex === 0 ? 'w-1/4' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export const SkeletonChart = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      <div className="animate-pulse">
        {/* Chart title */}
        <Skeleton className="h-6 w-1/3 mb-4" />
        
        {/* Chart area */}
        <div className="h-64 bg-gray-200 rounded flex items-end justify-between px-4 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-8 bg-gray-300"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const SkeletonList = ({ 
  items = 5, 
  showAvatar = true, 
  className = "" 
}: { 
  items?: number; 
  showAvatar?: boolean; 
  className?: string 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="animate-pulse flex items-center space-x-4 w-full">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export const SkeletonForm = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="animate-pulse">
        {/* Form title */}
        <Skeleton className="h-8 w-1/3 mb-6" />
        
        {/* Form fields */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {/* Textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

// Loading wrapper component
interface LoadingWrapperProps {
  loading: boolean
  skeleton?: 'text' | 'card' | 'table' | 'chart' | 'list' | 'form'
  children: React.ReactNode
  className?: string
}

export const LoadingWrapper = ({ 
  loading, 
  skeleton = 'card', 
  children, 
  className = "" 
}: LoadingWrapperProps) => {
  if (loading) {
    switch (skeleton) {
      case 'text':
        return <SkeletonText className={className} />
      case 'table':
        return <SkeletonTable className={className} />
      case 'chart':
        return <SkeletonChart className={className} />
      case 'list':
        return <SkeletonList className={className} />
      case 'form':
        return <SkeletonForm className={className} />
      default:
        return <SkeletonCard className={className} />
    }
  }

  return <>{children}</>
}
