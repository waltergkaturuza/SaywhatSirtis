"use client"

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

const NotificationItem = ({ notification, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`
      ${getBackgroundColor()}
      border rounded-lg p-4 mb-3 shadow-sm
      transform transition-all duration-300 ease-in-out
      ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          <div className="mt-1 text-sm text-gray-600">
            {notification.message}
          </div>
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onClose: (id: string) => void
}

export const NotificationContainer = ({ notifications, onClose }: NotificationContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const removeAllNotifications = () => {
    setNotifications([])
  }

  // Convenience methods
  const showSuccess = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration })
  }

  const showWarning = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }

  const showInfo = (title: string, message: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
