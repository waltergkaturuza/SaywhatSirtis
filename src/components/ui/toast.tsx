import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose: () => void
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 border rounded-lg shadow-lg z-50 ${getStyles()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-700 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast utility functions
let toastContainer: HTMLDivElement | null = null

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

function createToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
  if (typeof window === 'undefined') return

  const container = getToastContainer()
  const toastElement = document.createElement('div')
  container.appendChild(toastElement)

  const removeToast = () => {
    if (toastElement && container.contains(toastElement)) {
      container.removeChild(toastElement)
    }
  }

  // Auto remove after 5 seconds
  setTimeout(removeToast, 5000)

  return removeToast
}

export function showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
  return createToast(type, title, message)
}

export function showSuccess(title: string, message: string) {
  return createToast('success', title, message)
}

export function showError(title: string, message: string) {
  return createToast('error', title, message)
}

export function showWarning(title: string, message: string) {
  return createToast('warning', title, message)
}

export function showInfo(title: string, message: string) {
  return createToast('info', title, message)
}
