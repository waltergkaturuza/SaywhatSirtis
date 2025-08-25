import { useState } from 'react'

type ToastVariant = 'default' | 'destructive' | 'success'

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
}

interface Toast extends ToastProps {
  id: string
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const id = (++toastCount).toString()
    const newToast: Toast = {
      id,
      title,
      description,
      variant
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id))
    }
  }

  return {
    toast,
    toasts,
    dismiss: (toastId: string) => 
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }
}

// Export a simple toast function for easier use
export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // Simple console logging for now - in a real app this would integrate with a toast UI library
  const message = `${title ? title + ': ' : ''}${description || ''}`
  
  if (variant === 'destructive') {
    console.error('Toast Error:', message)
  } else if (variant === 'success') {
    console.log('Toast Success:', message)
  } else {
    console.log('Toast:', message)
  }
  
  // For development, also show browser notification if supported
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title || 'SIRTIS Notification', {
        body: description,
        icon: '/favicon.ico'
      })
    }
  }
}
