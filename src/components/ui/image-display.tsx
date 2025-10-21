"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageDisplayProps {
  src: string
  alt: string
  className?: string
  maxHeight?: string
  showError?: boolean
  onError?: (error: Error) => void
}

export function ImageDisplay({ 
  src, 
  alt, 
  className = '', 
  maxHeight = '24rem',
  showError = true,
  onError 
}: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true)
    setIsLoading(false)
    const error = new Error(`Failed to load image: ${src}`)
    onError?.(error)
    console.error('Image load error:', error)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  if (imageError && showError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg",
        className
      )}>
        <div className="text-4xl mb-2">📷</div>
        <p className="text-gray-500 text-sm">Image could not be displayed</p>
        <p className="text-gray-400 text-xs mt-1">Check console for details</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "max-w-full h-auto rounded-lg shadow-sm transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{ maxHeight }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

interface PhotoGalleryProps {
  photos: string[]
  className?: string
}

export function PhotoGallery({ photos, className = '' }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <span className="text-4xl mb-2 block">📷</span>
        <p>No photos available</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {photos.map((photo, index) => (
        <div key={index} className="relative">
          <ImageDisplay
            src={photo}
            alt={`Photo ${index + 1}`}
            className="w-full"
            maxHeight="20rem"
          />
        </div>
      ))}
    </div>
  )
}
