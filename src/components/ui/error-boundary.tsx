"use client"

import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error | null
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: Error | null
  resetError: () => void 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          
          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
              <pre className="text-xs text-red-700 overflow-auto">
                {error.message}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 text-xs">{error.stack}</pre>
                  </details>
                )}
              </pre>
            </div>
          )}
          
          <button
            onClick={resetError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

// Component-level error boundary for smaller sections
export const ComponentErrorBoundary = ({ 
  children, 
  fallback 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Component Error
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            This component failed to load. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-600">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          <button
            onClick={resetError}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
          {fallback}
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for error reporting
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'application'}:`, error)
    
    // In production, you might want to send errors to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error)
    }
  }

  return { handleError }
}

export default ErrorBoundary
